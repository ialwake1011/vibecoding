export type WordNode = {
  id: string;
  word: string;
  position: [number, number, number];
  relevance: number; // -1 to 1 (negative = discarded, positive = selected)
};

// 가상의 잠재 공간 데이터 생성
export const generateWordNodes = (count: number): WordNode[] => {
  const words = [
    "슬픔", "기억", "시간", "함께", "영원", "위로", "평안", "마음", "눈물", "안식",
    "축하", "파티", "기쁨", "환희", "행운", "내일", "빨리", "잊혀질", "끝", "시작",
    "갑작스러운", "운명", "아픔", "그리움", "별", "바람", "빛", "어둠", "소리", "침묵"
  ];

  return Array.from({ length: count }).map((_, i) => {
    // 임의의 3D 좌표 (구 형태의 분포)
    const radius = 10 + Math.random() * 20;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    // 단어 랜덤 할당 (관련성 로직은 실제 애니메이션에서 부여 예정이므로 초기값은 0)
    const wordIndex = Math.floor(Math.random() * words.length);
    const word = words[wordIndex];
    
    // 장례식 문맥과 어울리지 않는 단어는 음수 관련성 부여 (테스트용)
    const isNegative = ["축하", "파티", "기쁨", "환희", "행운", "빨리", "잊혀질"].includes(word);
    const isPositive = ["슬픔", "기억", "위로", "그리움", "영원"].includes(word);
    
    let relevance = (Math.random() * 0.4) - 0.2; // -0.2 ~ 0.2
    if (isNegative) relevance = -0.5 - Math.random() * 0.5; // -0.5 ~ -1.0
    if (isPositive) relevance = 0.5 + Math.random() * 0.5; // 0.5 ~ 1.0

    return {
      id: `node-${i}`,
      word,
      position: [x, y, z],
      relevance,
    };
  });
};
