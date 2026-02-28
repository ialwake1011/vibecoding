import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { LatentSpaceScene } from './LatentSpaceScene';
import { generateWordNodes } from './data';

export const MainComposition: React.FC = () => {
    // 30개의 단어 노드 랜덤 위치 생성
    const nodes = useMemo(() => generateWordNodes(30), []);

    return (
        <AbsoluteFill className="bg-[#050505]"> {/* 다크 모드 배경색 */}
            <ThreeCanvas
                width={1920}
                height={1080}
                camera={{ position: [0, 0, 40], fov: 75 }}
            >
                {/* 우주 공간의 조명 설정 */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#5588ff" />

                {/* 실제 3D 오브젝트들이 렌더링될 씬 컴포넌트 */}
                <LatentSpaceScene nodes={nodes} />
            </ThreeCanvas>
        </AbsoluteFill>
    );
};
