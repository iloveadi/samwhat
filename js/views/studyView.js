/**
 * studyView.js - [학습] 한자 원문 대조, 터치 훈음 팝업, 기승전결 해설, 퀴즈 & 필사
 */

import { store } from '../store.js';
import { renderHanjaButtonsHTML, createHanjaModalContent } from '../common/hanja.js';
import { delegate, showToast } from '../common/dom.js';

let activeSubTab = 'viewer'; // 'viewer' | 'steps' | 'quiz'

export const renderStudyView = (container) => {
  const { poems, currentStudyPoemId, settings } = store.state;
  const poem = store.getPoemById(currentStudyPoemId) || poems[0];
  if (!poem) return;

  const isBookmarked = store.isBookmarked(poem.id);

  container.innerHTML = `
    <div class="view-study animate-fade-in">
      <!-- 상단 작품 타이틀 및 액션 바 -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
        <div>
          <span class="eyebrow">${poem.author_name} · 제${poem.book}권</span>
          <h2 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
            ${poem.title_hanja}
          </h2>
          <p style="font-size: 14px; color: var(--color-ink-muted); margin-top: 2px;">
            ${poem.title_ko} (${poem.form})
          </p>
        </div>
        <button id="btn-study-bookmark" class="btn-icon" style="background-color: var(--color-surface-soft);" title="즐겨찾기">
          <svg width="20" height="20" fill="${isBookmarked ? 'var(--color-primary)' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      <!-- 서브 탭 (Pill 형태) -->
      <div class="pill-tabs-container" style="margin-bottom: 20px;">
        <button class="pill-tab ${activeSubTab === 'viewer' ? 'active' : ''}" data-subtab="viewer">한자·훈음 뷰어</button>
        <button class="pill-tab ${activeSubTab === 'steps' ? 'active' : ''}" data-subtab="steps">기승전결 해설</button>
        <button class="pill-tab ${activeSubTab === 'quiz' ? 'active' : ''}" data-subtab="quiz">퀴즈 & 연습</button>
      </div>

      <!-- 메인 학습 컨텐츠 영역 -->
      <div id="study-content-panel"></div>

      <!-- 작품간 이전/다음 이동 바 -->
      <div style="display: flex; justify-content: space-between; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--color-hairline);">
        <button id="btn-prev-poem" class="btn-secondary" style="font-size: 13px;">
          ← 이전 작품
        </button>
        <button id="btn-next-poem" class="btn-secondary" style="font-size: 13px;">
          다음 작품 →
        </button>
      </div>
    </div>

    <!-- 한자 훈음 상세 바텀시트 모달 -->
    <div id="hanja-modal" class="modal-overlay">
      <div class="modal-sheet">
        <div style="display: flex; justify-content: flex-end;">
          <button id="btn-close-modal" class="btn-icon" style="width: 32px; height: 32px; background: none;">✕</button>
        </div>
        <div id="hanja-modal-body"></div>
      </div>
    </div>
  `;

  const panel = container.querySelector('#study-content-panel');

  const renderSubView = () => {
    if (activeSubTab === 'viewer') {
      panel.innerHTML = `
        <div style="background-color: var(--color-surface-soft); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: var(--color-ink-muted);">
          💡 한자 글자를 터치하면 <strong>훈음(뜻과 소리)</strong> 확인 및 단어장 저장이 가능합니다.
        </div>
        <div>
          ${poem.lines.map(line => `
            <div style="margin-bottom: 18px;">
              <div class="hanja-line">
                ${renderHanjaButtonsHTML(line.words, settings.showSound)}
              </div>
              <div class="hanja-line-meaning">
                <strong>${line.hangeul}</strong><br/>
                <span style="color: #444;">${line.meaning}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="color-block cream" style="margin-top: 20px;">
          <span class="eyebrow">COMMENTARY</span>
          <div style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">작품 해설</div>
          <p style="font-size: 13px; line-height: 1.6; color: #222;">
            ${poem.interpretation}
          </p>
        </div>
      `;
    } else if (activeSubTab === 'steps') {
      panel.innerHTML = `
        <div>
          ${poem.lines.map((line, idx) => `
            <div class="color-block ${['lime', 'lilac', 'coral', 'mint'][idx % 4]}" style="padding: 16px 20px; margin-bottom: 12px;">
              <span class="eyebrow">${line.step || `구절 ${idx + 1}`}</span>
              <div style="font-family: var(--font-serif); font-size: 20px; font-weight: 700; margin-bottom: 4px;">
                ${line.hanja} <span style="font-size: 14px; font-weight: normal; color: #333;">(${line.hangeul})</span>
              </div>
              <p style="font-size: 14px; color: #222; margin-top: 4px;">
                ${line.meaning}
              </p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeSubTab === 'quiz') {
      const q = poem.quiz;
      panel.innerHTML = `
        <div style="margin-bottom: 24px;">
          <span class="eyebrow">QUIZ CHALLENGE</span>
          <h4 style="font-size: 17px; font-weight: 700; margin-bottom: 8px;">
            ${q.question}
          </h4>
          <div style="font-family: var(--font-serif); font-size: 22px; text-align: center; padding: 16px; background-color: var(--color-surface-soft); border-radius: var(--radius-md); margin-bottom: 16px; letter-spacing: 2px;">
            ${q.hanjaSnippet}
          </div>

          <div id="quiz-options-box">
            ${q.options.map((opt, idx) => `
              <button class="quiz-option-btn" data-index="${idx}">
                <span>${idx + 1}. ${opt}</span>
                <span class="quiz-status-icon"></span>
              </button>
            `).join('')}
          </div>

          <div id="quiz-result-msg" style="display: none; padding: 14px; border-radius: var(--radius-md); margin-top: 14px; font-size: 13px; line-height: 1.5;"></div>
        </div>

        <!-- 디지털 필사(타이핑 연습) 모듈 -->
        <div style="border-top: 1px solid var(--color-hairline); padding-top: 20px; margin-top: 20px;">
          <span class="eyebrow">DIGITAL TRANSCRIPTION</span>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">한글 독음 따라쓰기</h4>
          <p style="font-size: 12px; color: var(--color-ink-muted); margin-bottom: 10px;">
            제1구 "${poem.lines[0].hanja}"의 독음을 키보드로 직접 입력해 보세요.
          </p>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="transcription-input" class="search-input" placeholder="독음 입력 (예: ${poem.lines[0].hangeul})" style="padding-left: 16px;" />
            <button id="btn-check-transcription" class="btn-primary" style="padding: 0 18px; font-size: 13px; white-space: nowrap;">
              확인
            </button>
          </div>
          <div id="transcription-feedback" style="font-size: 12px; margin-top: 6px; font-weight: 600;"></div>
        </div>
      `;

      // 퀴즈 옵션 클릭
      const optBtns = panel.querySelectorAll('.quiz-option-btn');
      const resultBox = panel.querySelector('#quiz-result-msg');
      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const picked = parseInt(btn.dataset.index, 10);
          if (picked === q.answerIndex) {
            btn.classList.add('correct');
            resultBox.style.display = 'block';
            resultBox.style.backgroundColor = '#e6fcf5';
            resultBox.style.color = '#087f5b';
            resultBox.innerHTML = `<strong>정답입니다! 🎉</strong><br/>${q.explanation}`;
          } else {
            btn.classList.add('wrong');
            resultBox.style.display = 'block';
            resultBox.style.backgroundColor = '#fff5f5';
            resultBox.style.color = '#c92a2a';
            resultBox.innerHTML = `<strong>아쉽네요! 다시 풀어보세요.</strong><br/>${q.explanation}`;
          }
        });
      });

      // 필사 체크
      const checkBtn = panel.querySelector('#btn-check-transcription');
      const inputEl = panel.querySelector('#transcription-input');
      const fbEl = panel.querySelector('#transcription-feedback');
      if (checkBtn && inputEl) {
        checkBtn.addEventListener('click', () => {
          const val = inputEl.value.trim().replace(/\s+/g, '');
          const target = poem.lines[0].hangeul.replace(/\s+/g, '');
          if (val === target) {
            fbEl.style.color = 'var(--color-semantic-success)';
            fbEl.textContent = '✨ 완벽하게 일치합니다! 훌륭합니다.';
          } else {
            fbEl.style.color = 'var(--color-accent-magenta)';
            fbEl.textContent = `❌ 다시 확인해보세요. 정답: ${poem.lines[0].hangeul}`;
          }
        });
      }
    }
  };

  renderSubView();

  // 서브탭 전환
  delegate(container, 'click', '.pill-tab', (e, target) => {
    container.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
    activeSubTab = target.dataset.subtab;
    renderSubView();
  });

  // 북마크 토글
  const bookmarkBtn = container.querySelector('#btn-study-bookmark');
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      const isAdded = store.toggleBookmark(poem.id);
      showToast(isAdded ? '보관함에 저장되었습니다. 🔖' : '보관함에서 해제되었습니다.');
      bookmarkBtn.querySelector('svg').setAttribute('fill', isAdded ? 'var(--color-primary)' : 'none');
    });
  }

  // 이전/다음 작품 이동
  const currentIndex = poems.findIndex(p => p.id === poem.id);
  const prevBtn = container.querySelector('#btn-prev-poem');
  const nextBtn = container.querySelector('#btn-next-poem');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevIdx = (currentIndex - 1 + poems.length) % poems.length;
      window.location.hash = `study?id=${poems[prevIdx].id}`;
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextIdx = (currentIndex + 1) % poems.length;
      window.location.hash = `study?id=${poems[nextIdx].id}`;
    });
  }

  // 한자 버튼 클릭 -> 모달 오픈
  let currentWord = null;
  const modal = container.querySelector('#hanja-modal');
  const modalBody = container.querySelector('#hanja-modal-body');
  const closeModalBtn = container.querySelector('#btn-close-modal');

  delegate(container, 'click', '.hanja-char-btn', (e, target) => {
    currentWord = {
      char: target.dataset.char,
      hun: target.dataset.hun,
      eum: target.dataset.eum
    };
    modalBody.innerHTML = createHanjaModalContent(currentWord);
    modal.classList.add('open');

    // 단어장 추가 버튼 이벤트
    const addVocabBtn = modalBody.querySelector('#btn-add-word-vocab');
    if (addVocabBtn) {
      addVocabBtn.addEventListener('click', () => {
        const added = store.addVocabulary(currentWord);
        showToast(added ? `'${currentWord.char}' 단어장에 등록되었습니다! 📖` : '이미 등록된 단어입니다.');
        modal.classList.remove('open');
      });
    }
  });

  closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
};
