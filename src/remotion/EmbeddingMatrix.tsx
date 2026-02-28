import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { EmbeddingData } from "./transformerData";

interface MatrixProps {
    data: EmbeddingData;
}

export const EmbeddingMatrix: React.FC<MatrixProps> = ({ data }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const numTokens = data.tokens.length;
    const dim = data.embeddingDim;
    const totalCubes = numTokens * dim;

    // 큐브 크기 및 간격 설정
    const cubeSize = 0.8;
    const gap = 0.2;
    const step = cubeSize + gap;

    // 인스턴스 색상 데이터를 담을 배열 (Float32Array for performance)
    const colorArray = useMemo(() => new Float32Array(totalCubes * 3), [totalCubes]);

    // Three.js Color objects for re-use
    // 파란색(Negative) ~ 검정(0) ~ 빨간색(Positive)
    const colorNeg = new THREE.Color("#2563eb"); // Blue-600
    const colorZero = new THREE.Color("#171717"); // Neutral-900 (Dark)
    const colorPos = new THREE.Color("#dc2626"); // Red-600

    useEffect(() => {
        if (!meshRef.current) return;

        const dummy = new THREE.Object3D();
        const tempColor = new THREE.Color();

        let currIdx = 0;

        // x축: 임베딩 차원(Embedding Dims), y축: 토큰 시퀀스(Tokens)
        // 큐브 행렬을 화면 중앙에 정렬하기 위한 오프셋
        const xOffset = -(dim * step) / 2;
        const yOffset = (numTokens * step) / 2;

        for (let t = 0; t < numTokens; t++) {     // Rows (Tokens)
            for (let d = 0; d < dim; d++) {         // Cols (Dimensions)
                // 1D 배열에서 현재 값 가져오기
                const val = data.matrixValues[currIdx];

                // 1. 위치 설정 (그리드 레이아웃)
                const x = xOffset + (d * step);
                const y = yOffset - (t * step);
                const z = 0;

                dummy.position.set(x, y, z);

                // 데이터 값 크기에 비례하여 큐브의 깊이(Z축 Scale) 조절
                const zScale = Math.max(0.1, Math.abs(val) * 2);
                dummy.scale.set(1, 1, zScale);

                dummy.updateMatrix();
                meshRef.current.setMatrixAt(currIdx, dummy.matrix);

                // 2. 색상 설정 (Interpolation based on value)
                if (val < 0) {
                    tempColor.lerpColors(colorZero, colorNeg, Math.abs(val));
                } else {
                    tempColor.lerpColors(colorZero, colorPos, Math.abs(val));
                }

                tempColor.toArray(colorArray, currIdx * 3);
                currIdx++;
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true;

        // 인스턴스 컬러 설정
        meshRef.current.geometry.setAttribute(
            'color',
            new THREE.InstancedBufferAttribute(colorArray, 3)
        );

    }, [data, dim, numTokens, step, colorArray]);


    // 그룹 전체 애니메이션 (천천히 카메라 줌 인 & 기울임)
    useFrame(() => {
        if (groupRef.current) {
            // 아주 천천히 Y축 회전 관전 무빙
            groupRef.current.rotation.y = Math.sin(frame * 0.005) * 0.1;
            groupRef.current.rotation.x = Math.sin(frame * 0.003) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* 토큰 라벨 텍스트 (행렬 좌측 축) */}
            {data.tokens.map((tokenNode, idx) => {
                // 행 시작 위치 Y
                const y = ((numTokens * step) / 2) - (idx * step);
                const xOffset = -(dim * step) / 2;

                return (
                    <Html
                        key={tokenNode.id}
                        position={[xOffset - 2, y, 0]}
                        center
                        style={{
                            color: 'white',
                            fontFamily: 'sans-serif',
                            fontSize: '18px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                        }}
                    >
                        {tokenNode.token}
                    </Html>
                );
            })}

            {/* 대규모 큐브 행렬 인스턴스 렌더링 */}
            <instancedMesh
                ref={meshRef}
                args={[null as any, null as any, totalCubes]}
            >
                <boxGeometry args={[cubeSize, cubeSize, cubeSize]}>
                    <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
                </boxGeometry>
                {/* vertexColors 옵션을 켜야 인스턴스 색상이 적용됨 */}
                <meshStandardMaterial vertexColors={true} metalness={0.5} roughness={0.2} />
            </instancedMesh>
        </group>
    );
};
