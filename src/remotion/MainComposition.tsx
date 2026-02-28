import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { generateEmbeddingData, generateAttentionData, generateLogitData } from './transformerData';
import { EmbeddingMatrix } from './EmbeddingMatrix';
import { AttentionHeatmap } from './AttentionHeatmap';
import { LogitTerrain } from './LogitTerrain';
import { CameraRig } from './CameraRig';

export const MainComposition: React.FC = () => {
    // 사용자가 입력한 예시 문장 데이터 (슬픔, 기억, 위로 등의 문맥 포함)
    const inputSentence = "불의의 사고로 갑작스러운 이별을 맞이하여 어떤 위로의 말씀을 드려야 할지 모르겠습니다 따뜻했던 기억이 슬픔을 감싸 안기를";

    // 임베딩 차원수 (Visualizer용이므로 64~128 정도면 볼만함)
    const embeddingDim = 64;

    const data = useMemo(() => generateEmbeddingData(inputSentence, embeddingDim), [inputSentence, embeddingDim]);
    const attentionData = useMemo(() => generateAttentionData(data.tokens), [data.tokens]);
    const logitData = useMemo(() => generateLogitData(), []);

    // UI 설명문 연출용
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const t1 = 0;
    const t2 = 80;
    const t3 = 160;
    const t4 = 240;

    const captionOpacity1 = interpolate(frame, [t1, t1 + 15, t2 - 15, t2], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
    const captionOpacity2 = interpolate(frame, [t2, t2 + 15, t3 - 15, t3], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
    const captionOpacity3 = interpolate(frame, [t3, t3 + 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill className="bg-[#050505]"> {/* 다크 모드 배경색 */}
            {/* 2D UI 층 (화면 하단 설명 자막) */}
            <div style={{ position: 'absolute', bottom: 50, left: 0, width: '100%', textAlign: 'center', zIndex: 10, fontFamily: 'sans-serif' }}>
                <div style={{ position: 'absolute', width: '100%', opacity: captionOpacity1, color: '#60a5fa', fontSize: '32px', fontWeight: 'bold' }}>
                    1단계: 입력 텍스트 차원 변환 (Token Embeddings)
                </div>
                <div style={{ position: 'absolute', width: '100%', opacity: captionOpacity2, color: '#fbbf24', fontSize: '32px', fontWeight: 'bold' }}>
                    2단계: 문맥 어텐션 가중치 매트릭스 연산 (Self-Attention)
                </div>
                <div style={{ position: 'absolute', width: '100%', opacity: captionOpacity3, color: '#22d3ee', fontSize: '32px', fontWeight: 'bold' }}>
                    3단계: 최종 확률 예측 및 목표 단어 도출 (Softmax Logits)
                </div>
            </div>

            <ThreeCanvas
                width={1920}
                height={1080}
            >
                <CameraRig />

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
