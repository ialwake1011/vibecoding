import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Text } from '@react-three/drei';
import { WordNode } from './data';
import * as THREE from 'three';

export const LatentSpaceScene: React.FC<{ nodes: WordNode[] }> = ({ nodes }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // 코어(중앙 허브) 회전 레퍼런스
    const coreRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        // 3D 씬 전체가 천천히 회전하는 애니메이션
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.001;
            groupRef.current.rotation.x += 0.0005;
        }
    });

    // 애니메이션 진행률 (0 to 1)
    const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <group ref={groupRef}>
            {/* 1. 중앙 뇌(Core) 오브젝트 */}
            <mesh ref={coreRef} position={[0, 0, 0]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#5588ff"
                    emissiveIntensity={1.5}
                    wireframe={true}
                />
            </mesh>

            {/* 2. 허공에 떠 있는 단어 노드들 */}
            {nodes.map((node, index) => {
                // 단어의 색상: 연관도에 따라 다름 (음수=빨강, 접근금지 / 양수=파랑, 채택)
                const isNegative = node.relevance < -0.2;
                const isPositive = node.relevance > 0.2;

                let color = "#888888"; // 기본 회색
                if (isNegative) color = "#ff4444"; // 부정적 단어 (축하, 파티 등)
                if (isPositive) color = "#44aaff"; // 긍정적 단어 (위로, 슬픔 등)

                // 등장 애니메이션 (투명도 조절)
                const opacity = interpolate(
                    frame - (index * 2), // 노드마다 순차적으로 등장
                    [0, 20],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                    <group key={node.id} position={node.position as any}>
                        {/* 단어의 점(Point) */}
                        <mesh>
                            <sphereGeometry args={[0.2, 16, 16]} />
                            <meshBasicMaterial color={color} transparent opacity={opacity} />
                        </mesh>

                        {/* 단어 텍스트 */}
                        <Text
                            position={[0, 0.5, 0]}
                            fontSize={1}
                            color={color}
                            anchorX="center"
                            anchorY="middle"
                            fillOpacity={opacity}
                        >
                            {node.word}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
};
