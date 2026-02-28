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

export type VocabLogit = {
    id: string;
    word: string;
    probability: number; // 0.0 ~ 1.0 (Softmax)
    isTarget: boolean; // 최종 선택된 단어인지 여부
};

export type LogitData = {
    vocabSize: number;
    predictions: VocabLogit[];
};

export const generateLogitData = (): LogitData => {
    // 테마에 맞는 후보 단어들
    const words = [
        "위로", "기억", "슬픔", "함께", "영원", "평안", "마음", "눈물", "안식", "시간",
        "별", "아픔", "바람", "빛", "어둠", "소리", "침묵", "운명", "그리움", "내일",
        "축하", "파티", "기쁨", "환희", "행운", "빨리", "잊혀질", "끝", "시작", "안녕"
    ];

    const vocabSize = 100; // 시각적 웅장함을 위해 더미 단어(빈 큐브)를 포함한 총 보카 사이즈
    const predictions: VocabLogit[] = [];

    // 목표 단어 (문맥상 맞게 예측된 가장 높은 확률을 가진 단어)
    const targetWord = "위로";

    for (let i = 0; i < vocabSize; i++) {
        let prob = Math.random() * 0.1; // 기본적으로 매우 낮은 잡음 확률
        let word = "";
        let isTarget = false;

        // 의미 있는 단어들 매핑 (앞쪽 인덱스에 배치)
        if (i < words.length) {
            word = words[i];
            // 긍정적/부정적 맥락에 따른 확률 조작
            if (["축하", "파티", "기쁨", "행운", "빨리"].includes(word)) {
                prob = 0.01; // 문맥에 맞지 않아 확률 매우 낮음
            } else if (["기억", "슬픔", "마음", "그리움"].includes(word)) {
                prob = 0.3 + (Math.random() * 0.4); // 꽤 높은 후보군
            }
        }

        if (word === targetWord) {
            prob = 0.95; // 정답 예측! (가장 높은 막대)
            isTarget = true;
        }

        predictions.push({
            id: `vocab-${i}`,
            word,
            probability: prob,
            isTarget
        });
    }

    // 그리드의 멋진 지형을 위해 랜덤으로 셔플하되, Target 단어는 중앙쯤 배치되도록 약간 조정 가능
    return { vocabSize, predictions };
};
