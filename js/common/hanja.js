/**
 * hanja.js - 한자 훈음 및 루비 태그 포맷팅 공용 유틸리티 (Rule 1 준수)
 */

/**
 * 한자 글자 리스트를 인터랙티브 버튼 HTML로 변환
 * @param {Array<{char: string, hun: string, eum: string}>} words 
 * @param {boolean} showSound 독음 상시 표기 여부
 * @returns {string}
 */
export const renderHanjaButtonsHTML = (words, showSound = true) => {
  if (!words || !Array.isArray(words)) return '';

  return words.map(w => `
    <button class="hanja-char-btn" data-char="${w.char}" data-hun="${w.hun}" data-eum="${w.eum}" title="${w.hun} ${w.eum}">
      <span class="hanja-char-glyph">${w.char}</span>
      ${showSound ? `<span class="hanja-char-sound">${w.eum}</span>` : ''}
    </button>
  `).join('');
};

/**
 * 간단한 루비(ruby) 태그 형태로 변환 (독음 윗첨자)
 * @param {Array<{char: string, hun: string, eum: string}>} words 
 * @returns {string}
 */
export const renderRubyHTML = (words) => {
  if (!words || !Array.isArray(words)) return '';
  return words.map(w => `<ruby>${w.char}<rt>${w.eum}</rt></ruby>`).join(' ');
};

/**
 * 한자 상세 모달 내용 템플릿 생성
 * @param {{char: string, hun: string, eum: string}} word 
 * @returns {string}
 */
export const createHanjaModalContent = (word) => {
  return `
    <div style="text-align: center; padding: 8px 0;">
      <div style="font-family: var(--font-serif); font-size: 54px; font-weight: bold; margin-bottom: 8px;">
        ${word.char}
      </div>
      <div style="font-size: 20px; font-weight: 700; color: var(--color-ink); margin-bottom: 4px;">
        ${word.hun} <span style="color: var(--color-accent-magenta);">${word.eum}</span>
      </div>
      <div style="font-size: 13px; color: var(--color-ink-muted); margin-bottom: 20px;">
        삼한시귀감 수록 주요 시어
      </div>
      <button id="btn-add-word-vocab" class="btn-primary" style="width: 100%;">
        단어장에 추가
      </button>
    </div>
  `;
};
