// 텍스트 토큰 및 임베딩 매트릭스 데이터 구조
export type TokenNode = {
    id: string;
    token: string;
    isInput: boolean; // 사용자가 입력한 컨텍스트 토큰인지 여부
};

export type EmbeddingData = {
    tokens: TokenNode[];
    embeddingDim: number; // 각 토큰이 가지는 벡터 차원 수 (예: 64)
    matrixValues: Float32Array; // 전체 토큰 x 임베딩 차원의 1D 배열 데이터 (InstancedMesh 컬러/스케일용)
};

// 가상의 트랜스포머 토큰 임베딩 데이터 생성
export const generateEmbeddingData = (
    inputText: string,
    embeddingDim: number = 64
): EmbeddingData => {
    // 간단한 형태소 분석(띄어쓰기 기준) 시뮬레이션
    const rawTokens = inputText.split(" ").filter(t => t.trim() !== "");
    const tokenCount = rawTokens.length;

    const tokens: TokenNode[] = rawTokens.map((t, i) => ({
        id: `token-${i}`,
        token: t,
        isInput: true,
    }));

    // 각 [토큰 수 x 차원 수] 크기의 임의의 매트릭스 스칼라 값 생성 (-1.0 ~ 1.0)
    // 실제 모델의 임베딩 분포와 유사하게 정규분포 느낌의 난수 생성
    const numElements = tokenCount * embeddingDim;
    const matrixValues = new Float32Array(numElements);

    for (let i = 0; i < numElements; i++) {
        // -1 ~ 1 사이의 랜덤 값 (극단값 위주)
        let val = (Math.random() * 2) - 1;
        // 시각적 대비를 위해 중간값 영역을 살짝 줄임
        val = Math.sign(val) * Math.pow(Math.abs(val), 0.5);
        matrixValues[i] = val;
    }

    return {
        tokens,
        embeddingDim,
        matrixValues,
    };
};

export type AttentionData = {
    tokens: TokenNode[];
    weights: Float32Array; // Token x Token 2D 배열을 1D로 평탄화 (0.0 ~ 1.0)
};

// 가상의 셀프 어텐션 가중치 데이터 생성 (토큰 간 관계도)
export const generateAttentionData = (tokens: TokenNode[]): AttentionData => {
    const n = tokens.length;
    const weights = new Float32Array(n * n);

    for (let r = 0; r < n; r++) {
        let rowSum = 0;
        // 임의의 가중치 부여
        for (let c = 0; c < n; c++) {
            // 대각선(자기 자신)이나, 특정 연관 단어에 높은 가중치 부여를 흉내냄
            let w = Math.random();
            if (r === c) w += 1.0; // 자기 자신

            const val = Math.max(0, w);
            weights[r * n + c] = val;
            rowSum += val;
        }
        // Softmax 흉내내기 (행의 합을 1로 만들기)
        for (let c = 0; c < n; c++) {
            weights[r * n + c] /= rowSum;
        }
    }

    return { tokens, weights };
};
