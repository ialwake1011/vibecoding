import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { LogitData } from "./transformerData";

interface TerrainProps {
    data: LogitData;
    position?: [number, number, number];
}

export const LogitTerrain: React.FC<TerrainProps> = ({ data, position = [0, 0, 0] }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // 10x10 그리드 지형 생성 (총 100개 단어)
    const gridSize = Math.ceil(Math.sqrt(data.vocabSize));
    const totalBars = data.vocabSize;

    const barSize = 0.8;
    const gap = 0.2;
    const step = barSize + gap;

    const colorArray = useMemo(() => new Float32Array(totalBars * 3), [totalBars]);

    // 색상 팔레트
    const colorLow = new THREE.Color("#1e1b4b"); // Indigo 950 (매우 낮은 확률, 거의 꺼짐)
    const colorMid = new THREE.Color("#6366f1"); // Indigo 500 (어느정도 확률 있음)
    const colorHigh = new THREE.Color("#22d3ee"); // Cyan 400 (가장 유력한 토큰)

    useEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();
        const tempColor = new THREE.Color();

        const offset = (gridSize * step) / 2;

        for (let i = 0; i < totalBars; i++) {
            const pred = data.predictions[i];

            const r = Math.floor(i / gridSize);
            const c = i % gridSize;

            // 1. 위치 설정
            const x = -offset + (c * step);
            const z = -offset + (r * step);
            // y값은 애니메이션으로 조절하므로 기본 위치는 0
            dummy.position.set(x, 0, z);

            // 높이 (확률에 비례, 최소 높이 0.2 유지)
            const height = Math.max(0.2, pred.probability * 15);
            dummy.scale.set(1, height, 1);
            // 박스의 중심이 정중앙이므로 바닥이 동일선상에 오도록 y축 이동
            dummy.position.y = height / 2;

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // 2. 색상 설정
            if (pred.probability < 0.2) {
                tempColor.lerpColors(colorLow, colorMid, pred.probability * 5);
            } else {
                tempColor.lerpColors(colorMid, colorHigh, (pred.probability - 0.2) / 0.8);
            }

            // 타겟(선택된) 단어는 눈부신 흰색/시안색
            if (pred.isTarget) {
                tempColor.set("#06b6d4"); // Cyan 500
            }

            tempColor.toArray(colorArray, i * 3);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));

    }, [data, gridSize, step, colorArray]);

    // 씬 입장 및 애니메이션 (타겟 단어가 팝업 되는 효과)
    useFrame(() => {
        if (groupRef.current) {
            // 전체 지형이 천천히 회전
            groupRef.current.rotation.y = frame * -0.002;
        }
    });

    // 목표 단어 (isTarget)이 뛰어오르는 애니메이션 (스프링)
    const targetPopUp = spring({
        frame: frame - 60, // 2초 뒤 구동 
        fps,
        config: { damping: 10, mass: 0.5, stiffness: 100 },
    });

    return (
        <group ref={groupRef} position={position}>
            {/* 바닥을 나타내는 은은한 플랫폼 */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[gridSize * step + 2, gridSize * step + 2]} />
                <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
            </mesh>

            {/* 3D 막대 그래프 렌더링 */}
            <instancedMesh ref={meshRef} args={[null as any, null as any, totalBars]}>
                <boxGeometry args={[barSize, 1, barSize]}>
                    <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
                </boxGeometry>
                <meshStandardMaterial vertexColors={true} metalness={0.8} roughness={0.2} emissive="#06b6d4" emissiveIntensity={0.2} />
            </instancedMesh>

            {/* 의미가 있는 상위 텍스트 라벨 (가장 높은 확률을 가진 단어들만 렌더링) */}
            {data.predictions.map((pred, i) => {
                if (!pred.word || pred.probability < 0.1) return null; // 잡음 텍스트는 숨김

                const r = Math.floor(i / gridSize);
                const c = i % gridSize;
                const offset = (gridSize * step) / 2;

                const x = -offset + (c * step);
                const z = -offset + (r * step);
                const baseHeight = Math.max(0.2, pred.probability * 15);

                // 타겟 텍스트는 팝업 애니메이션 적용
                const yPos = pred.isTarget ? baseHeight + (targetPopUp * 5) + 0.5 : baseHeight + 0.5;
                const isTargetLabel = pred.isTarget;

                return (
                    <Html
                        key={`logit-${i}`}
                        position={[x, yPos, z]}
                        center
                        style={{
                            color: isTargetLabel ? '#ffffff' : '#94a3b8',
                            fontFamily: 'sans-serif',
                            fontSize: isTargetLabel ? `${16 + targetPopUp * 10}px` : '12px',
                            fontWeight: isTargetLabel ? 'bold' : 'normal',
                            textShadow: isTargetLabel ? '0 0 10px rgba(6, 182, 212, 1)' : 'none',
                            transform: `translate3d(0, ${isTargetLabel ? -targetPopUp * 20 : 0}px, 0)`,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            transition: 'all 0.1s ease',
                        }}
                    >
                        {pred.word}
                    </Html>
                );
            })}
        </group>
    );
};
