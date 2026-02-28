import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { generateEmbeddingData, generateAttentionData, generateLogitData } from './transformerData';
import { EmbeddingMatrix } from './EmbeddingMatrix';
import { AttentionHeatmap } from './AttentionHeatmap';
import { LogitTerrain } from './LogitTerrain';

export const MainComposition: React.FC = () => {
    // 사용자가 입력한 예시 문장 데이터 (슬픔, 기억, 위로 등의 문맥 포함)
    const inputSentence = "불의의 사고로 갑작스러운 이별을 맞이하여 어떤 위로의 말씀을 드려야 할지 모르겠습니다 따뜻했던 기억이 슬픔을 감싸 안기를";

    // 임베딩 차원수 (Visualizer용이므로 64~128 정도면 볼만함)
    const embeddingDim = 64;

    const data = useMemo(() => generateEmbeddingData(inputSentence, embeddingDim), [inputSentence, embeddingDim]);
    const attentionData = useMemo(() => generateAttentionData(data.tokens), [data.tokens]);
    const logitData = useMemo(() => generateLogitData(), []);

    return (
        <AbsoluteFill className="bg-[#050505]"> {/* 다크 모드 배경색 */}
            <ThreeCanvas
                width={1920}
                height={1080}
                camera={{ position: [0, 0, 70], fov: 60 }} // 카메라 전체 조망을 위해 뒤로 이동
            >
                {/* 매트릭스를 입체적으로 보이게 하는 조명 설정 */}
                <ambientLight intensity={0.4} />
                <pointLight position={[20, 20, 20]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-20, -20, -20]} intensity={0.8} color="#2563eb" />
                <directionalLight position={[0, 0, 10]} intensity={0.5} />

                {/* 1단계. 트랜스포머 임베딩 매트릭스 시각화 컴포넌트 (좌측) */}
                <group position={[-30, 0, 0]}>
                    <EmbeddingMatrix data={data} />
                </group>

                {/* 2단계. 트랜스포머 어텐션 히트맵 시각화 컴포넌트 (중앙) */}
                <group position={[0, 0, 0]}>
                    <AttentionHeatmap data={attentionData} />
                </group>

                {/* 3단계. 피드포워드 및 확률 분포 로짓 텍스트 타워 컴포넌트 (우측) */}
                <group position={[35, -5, 0]}>
                    <LogitTerrain data={logitData} />
                </group>
            </ThreeCanvas>
        </AbsoluteFill>
    );
};
