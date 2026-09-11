/**
 * homeView.js - [홈] 오늘의 시 및 데일리 대시보드 뷰 모듈
 */

import { store } from '../store.js';
import { getDailyPoemIndex, updateDailyStreak } from '../common/date.js';
import { showToast } from '../common/dom.js';

export const renderHomeView = (container) => {
  const { poems, lastReadPoemId } = store.state;
  if (!poems || poems.length === 0) return;

  const dailyIndex = getDailyPoemIndex(poems.length);
  const dailyPoem = poems[dailyIndex] || poems[0];
  const lastReadPoem = store.getPoemById(lastReadPoemId) || poems[0];
  const streak = updateDailyStreak();

  container.innerHTML = `
    <div class="view-home animate-fade-in">
      <!-- 헤더 보조 정보 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <span class="eyebrow" style="margin-bottom: 2px;">DAILY SELECTION</span>
          <h2 style="font-size: 20px; font-weight: 800; letter-spacing: -0.4px;">오늘의 명시</h2>
        </div>
        <div class="streak-pill" title="연속 출석">
          🔥 ${streak.count}일째 수양 중
        </div>
      </div>

      <!-- 오늘의 시: 시그니처 파스텔 컬러블록 카드 -->
      <div class="color-block ${dailyPoem.color_theme || 'lime'}">
        <span class="eyebrow">三韓詩龜鑑 · 제${dailyPoem.book}권</span>
        <h3 class="block-title">${dailyPoem.title_hanja}</h3>
        <p class="block-subtitle">${dailyPoem.title_ko} · ${dailyPoem.author_name}</p>

        <!-- 원문 발췌 프리뷰 -->
        <div class="poem-preview-box">
          ${dailyPoem.lines.slice(0, 2).map(l => `<div>${l.hanja} <span class="poem-preview-sound">(${l.hangeul})</span></div>`).join('')}
        </div>

        <p class="poem-card-summary">
          "${dailyPoem.summary}"
        </p>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="#study?id=${dailyPoem.id}" class="btn-primary" style="flex: 1; text-align: center;">
            학습 시작하기
          </a>
          <button id="btn-copy-daily-poem" class="btn-secondary" title="시구 복사">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            공유
          </button>
        </div>
      </div>

      <!-- 최근 읽던 시 이어보기 섹션 -->
      <div style="margin-top: 24px;">
        <span class="eyebrow">CONTINUE STUDY</span>
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">최근 읽던 작품</h4>
        
        <a href="#study?id=${lastReadPoem.id}" class="item-card" style="display: flex;">
          <div class="item-card-left">
            <div class="item-title-row">
              <span class="item-title-hanja">${lastReadPoem.title_hanja}</span>
              <span class="item-title-ko">${lastReadPoem.title_ko}</span>
            </div>
            <div class="item-meta">
              ${lastReadPoem.author_name} · ${lastReadPoem.form}
            </div>
          </div>
          <button class="btn-secondary" style="padding: 6px 14px; font-size: 13px;">
            이어하기
          </button>
        </a>
      </div>

      <!-- 삼한시귀감 가이드 미니 카드 -->
      <div class="color-block lilac" style="margin-top: 16px; padding: 18px 20px;">
        <span class="eyebrow">ABOUT ARCHIVE</span>
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">《삼한시귀감(三韓詩龜鑑)》이란?</div>
        <p style="font-size: 12px; color: #444; line-height: 1.5;">
          고려 고종 때 최자(崔滋)가 신라와 고려의 뛰어난 한시를 엄선하여 엮은 시선집으로, 우리 선조들의 탁월한 문학성과 정신세계를 오롯이 담고 있습니다.
        </p>
      </div>
    </div>
  `;

  // 공유/복사 이벤트 바인딩
  const copyBtn = container.querySelector('#btn-copy-daily-poem');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = `[삼한시귀감 오늘의 명시]\n${dailyPoem.title_hanja} (${dailyPoem.title_ko}) - ${dailyPoem.author_name}\n\n` +
        dailyPoem.lines.map(l => `${l.hanja} (${l.meaning})`).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        showToast('오늘의 명시가 클립보드에 복사되었습니다! ✨');
      } catch (err) {
        showToast('텍스트 복사에 실패했습니다.');
      }
    });
  }
};
