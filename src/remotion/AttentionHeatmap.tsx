import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { AttentionData } from "./transformerData";

interface HeatmapProps {
    data: AttentionData;
    position?: [number, number, number];
}

export const AttentionHeatmap: React.FC<HeatmapProps> = ({ data, position = [0, 0, 0] }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const numTokens = data.tokens.length;
    const totalCells = numTokens * numTokens;

    // 큐브 크기 및 간격 설정
    const cubeSize = 0.8;
    const gap = 0.1;
    const step = cubeSize + gap;

    // 인스턴스 색상 데이터를 담을 배열
    const colorArray = useMemo(() => new Float32Array(totalCells * 3), [totalCells]);

    // Color objects for re-use: Black (0) -> Bright Yellow/White (High Attention)
    const colorZero = new THREE.Color("#0a0a0a"); // 아주 어두운 회색
    const colorHigh = new THREE.Color("#fbbf24"); // Amber-400 (빛나는 황금색)

    useEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();
        const tempColor = new THREE.Color();

        let currIdx = 0;

        // N x N 행렬을 중앙 정렬하기 위한 오프셋
        const offset = (numTokens * step) / 2;

        for (let r = 0; r < numTokens; r++) {     // Rows (Query Token)
            for (let c = 0; c < numTokens; c++) {     // Cols (Key Token)
                const weight = data.weights[currIdx];

                // 1. 위치 설정 (그리드 레이아웃)
                const x = -offset + (c * step);
                const y = offset - (r * step);
                const z = 0;

                dummy.position.set(x, y, z);

                // 데이터 값 크기에 비례하여 큐브의 깊이(Z축 Scale) 조절
                // 가중치가 높을수록 툭 튀어나옴
                const zScale = Math.max(0.05, weight * 4);
                dummy.scale.set(1, 1, zScale);

                dummy.updateMatrix();
                meshRef.current.setMatrixAt(currIdx, dummy.matrix);

                // 2. 색상 설정 (Interpolation based on Attention weight)
                tempColor.lerpColors(colorZero, colorHigh, weight);
                tempColor.toArray(colorArray, currIdx * 3);

                currIdx++;
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.geometry.setAttribute(
            'color',
            new THREE.InstancedBufferAttribute(colorArray, 3)
        );

    }, [data, numTokens, step, colorArray]);

    return (
        <group ref={groupRef} position={position}>
            {/* 쿼리 방향 라벨 (좌측 축: Rows) */}
            {data.tokens.map((tokenNode, idx) => {
                const y = ((numTokens * step) / 2) - (idx * step);
                const xOffset = -(numTokens * step) / 2;

                return (
                    <Html
                        key={`row-${tokenNode.id}`}
                        position={[xOffset - 1, y, 0]}
                        center
                        style={{
                            color: '#fbbf24',
                            fontFamily: 'sans-serif',
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            opacity: 0.8,
                        }}
                    >
                        {tokenNode.token}
                    </Html>
                );
            })}

            {/* 키 방향 라벨 (상단 축: Cols) */}
            {data.tokens.map((tokenNode, idx) => {
                const x = -(numTokens * step) / 2 + (idx * step);
                const yOffset = ((numTokens * step) / 2);

                return (
                    <Html
                        key={`col-${tokenNode.id}`}
                        position={[x, yOffset + 1, 0]}
                        center
                        style={{
                            color: '#38bdf8', // 하늘색 코어
                            fontFamily: 'sans-serif',
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            opacity: 0.8,
                            transform: 'rotate(-45deg)', // 대각선으로 기울여서 겹침 방지
                            transformOrigin: 'bottom left'
                        }}
                    >
                        {tokenNode.token}
                    </Html>
                );
            })}

            {/* N x N 어텐션 큐브 행렬 인스턴스 렌더링 */}
            <instancedMesh
                ref={meshRef}
                args={[null as any, null as any, totalCells]}
            >
                <boxGeometry args={[cubeSize, cubeSize, cubeSize]}>
                    <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
                </boxGeometry>
                <meshStandardMaterial
                    vertexColors={true}
                    metalness={0.8}
                    roughness={0.1}
                    emissive="#fbbf24"
                    emissiveIntensity={0.2}
                />
            </instancedMesh>
        </group>
    );
};
