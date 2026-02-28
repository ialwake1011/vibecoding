import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export const CameraRig: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const { camera } = useThree();

    // 튜닝할 카메라 키프레임 (position과 lookAt)
    // 1단계(임베딩): [-30, 0, 0] 직시
    // 2단계(어텐션): [0, 0, 0] 하이앵글 직시
    // 3단계(로짓): [35, -5, 0] 로우앵글/줌인

    // 타임라인 구획 (총 300프레임 중)
    const t1 = 0;
    const t2 = 80;
    const t3 = 160;
    const t4 = 240;

    useFrame(() => {
        // 카메라의 위치 (Position)
        const posX = interpolate(frame, [t1, t2, t3, t4, durationInFrames], [-50, -30, 0, 35, 35], { extrapolateRight: 'clamp' });
        const posY = interpolate(frame, [t1, t2, t3, t4, durationInFrames], [20, 10, 40, 5, -5], { extrapolateRight: 'clamp' });
        const posZ = interpolate(frame, [t1, t2, t3, t4, durationInFrames], [30, 25, 40, 30, 20], { extrapolateRight: 'clamp' });

        // 카메라가 바라보는 목표점 (LookAt)
        const lookX = interpolate(frame, [t1, t2, t3, t4, durationInFrames], [-30, -30, 0, 35, 35], { extrapolateRight: 'clamp' });
        const lookY = interpolate(frame, [t1, t2, t3, t4, durationInFrames], [0, 0, 0, -5, 5], { extrapolateRight: 'clamp' }); // 3단계에서 서서히 위로 바라보며 팝업되는 단어 조명
        const lookZ = interpolate(frame, [t1, t2, t3, t4, durationInFrames], [0, 0, 0, 0, 0], { extrapolateRight: 'clamp' });

        camera.position.set(posX, posY, posZ);
        camera.lookAt(lookX, lookY, lookZ);
    });

    return null; // 렌더링할 3D 객체는 없고 카메라 제어만 수행함
};
