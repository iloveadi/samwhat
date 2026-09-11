/**
 * archiveView.js - [보관함 & 설정] 즐겨찾기, 암기 단어장, 글꼴 크기/독음 설정
 */

import { store } from '../store.js';
import { delegate, showToast } from '../common/dom.js';
import { storage } from '../common/storage.js';

let activeArchiveTab = 'bookmarks'; // 'bookmarks' | 'vocab' | 'settings'

export const renderArchiveView = (container) => {
  const { poems, bookmarks, vocabulary, settings } = store.state;

  container.innerHTML = `
    <div class="view-archive animate-fade-in">
      <div style="margin-bottom: 16px;">
        <span class="eyebrow">SAVED & SETTINGS</span>
        <h2 style="font-size: 20px; font-weight: 800; letter-spacing: -0.4px;">보관함 및 설정</h2>
      </div>

      <!-- 서브 탭 (Pill 형태) -->
      <div class="pill-tabs-container" style="margin-bottom: 20px;">
        <button class="pill-tab ${activeArchiveTab === 'bookmarks' ? 'active' : ''}" data-archivetab="bookmarks">
          즐겨찾기 (${bookmarks.length})
        </button>
        <button class="pill-tab ${activeArchiveTab === 'vocab' ? 'active' : ''}" data-archivetab="vocab">
          암기 단어장 (${vocabulary.length})
        </button>
        <button class="pill-tab ${activeArchiveTab === 'settings' ? 'active' : ''}" data-archivetab="settings">
          환경 설정
        </button>
      </div>

      <!-- 보관함 세부 패널 -->
      <div id="archive-content-panel"></div>
    </div>
  `;

  const panel = container.querySelector('#archive-content-panel');

  const renderArchiveContent = () => {
    if (activeArchiveTab === 'bookmarks') {
      const bookmarkedPoems = poems.filter(p => bookmarks.includes(p.id));
      if (bookmarkedPoems.length === 0) {
        panel.innerHTML = `
          <div style="text-align: center; padding: 48px 16px; color: var(--color-ink-muted);">
            <div style="font-size: 36px; margin-bottom: 8px;">🔖</div>
            <p style="font-size: 14px;">저장된 시가 없습니다.</p>
            <p style="font-size: 12px; margin-top: 4px;">작품에서 책갈피 아이콘을 눌러 즐겨찾기에 추가해보세요.</p>
          </div>
        `;
        return;
      }

      panel.innerHTML = `
        <div>
          ${bookmarkedPoems.map(p => `
            <div class="item-card" data-poem-id="${p.id}">
              <div class="item-card-left">
                <div class="item-title-row">
                  <span class="item-title-hanja">${p.title_hanja}</span>
                  <span class="item-title-ko">${p.title_ko}</span>
                </div>
                <div class="item-meta">
                  제${p.book}권 · ${p.author_name}
                </div>
              </div>
              <button class="btn-remove-bookmark btn-icon" data-id="${p.id}" title="삭제" style="background: none; width: 36px; height: 36px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `).join('')}
        </div>
      `;

      delegate(panel, 'click', '.btn-remove-bookmark', (e, target) => {
        e.stopPropagation();
        const id = target.dataset.id;
        store.toggleBookmark(id);
        showToast('즐겨찾기에서 제거되었습니다.');
        renderArchiveContent();
      });

      delegate(panel, 'click', '.item-card', (e, target) => {
        const poemId = target.dataset.poemId;
        window.location.hash = `study?id=${poemId}`;
      });

    } else if (activeArchiveTab === 'vocab') {
      if (vocabulary.length === 0) {
        panel.innerHTML = `
          <div style="text-align: center; padding: 48px 16px; color: var(--color-ink-muted);">
            <div style="font-size: 36px; margin-bottom: 8px;">📖</div>
            <p style="font-size: 14px;">저장된 한자 단어가 없습니다.</p>
            <p style="font-size: 12px; margin-top: 4px;">학습 뷰어에서 한자를 터치하여 단어장에 추가해보세요.</p>
          </div>
        `;
        return;
      }

      panel.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          ${vocabulary.map(v => `
            <div style="background-color: var(--color-surface-soft); border-radius: var(--radius-md); padding: 14px; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-family: var(--font-serif); font-size: 28px; font-weight: bold; line-height: 1;">${v.char}</span>
                <button class="btn-remove-vocab" data-char="${v.char}" style="color: var(--color-ink-muted); font-size: 14px; padding: 2px 4px;">✕</button>
              </div>
              <div style="font-size: 13px; font-weight: 700; margin-top: 8px;">
                ${v.hun} <span style="color: var(--color-accent-magenta);">${v.eum}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      delegate(panel, 'click', '.btn-remove-vocab', (e, target) => {
        const char = target.dataset.char;
        store.removeVocabulary(char);
        showToast(`'${char}' 단어가 삭제되었습니다.`);
        renderArchiveContent();
      });

    } else if (activeArchiveTab === 'settings') {
      panel.innerHTML = `
        <div class="color-block cream" style="padding: 18px 20px; margin-bottom: 20px;">
          <span class="eyebrow">APP PREFERENCES</span>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">학습 환경 설정</h4>
          <p style="font-size: 12px; color: #555;">개인 맞춤 가독성과 표기 옵션을 설정할 수 있습니다.</p>
        </div>

        <div style="margin-bottom: 20px; padding: 0 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <div style="font-size: 14px; font-weight: 600;">한자 독음(한글 음) 상시 표기</div>
              <div style="font-size: 12px; color: var(--color-ink-muted);">원문 아래에 한글 음을 함께 노출합니다.</div>
            </div>
            <input type="checkbox" id="toggle-sound" ${settings.showSound ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
          </div>

          <div style="border-top: 1px solid var(--color-hairline); padding-top: 16px; margin-top: 16px;">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">데이터 초기화</div>
            <div style="font-size: 12px; color: var(--color-ink-muted); margin-bottom: 12px;">저장된 북마크, 단어장, 스트릭 데이터를 초기화합니다.</div>
            <button id="btn-reset-data" class="btn-secondary" style="color: #c92a2a; border-color: #ffc9c9;">
              모든 데이터 초기화
            </button>
          </div>

          <div style="border-top: 1px solid var(--color-hairline); padding-top: 20px; margin-top: 20px; text-align: center; color: var(--color-ink-muted); font-size: 11px;">
            <div>삼..뭐라구? (삼한시귀감 학습 서비스) v1.0.0</div>
            <div style="margin-top: 2px;">Powered by Pure Vanilla & Cloudflare Pages Ready</div>
          </div>
        </div>
      `;

      // 독음 설정 변경
      const toggleSound = panel.querySelector('#toggle-sound');
      if (toggleSound) {
        toggleSound.addEventListener('change', (e) => {
          store.updateSettings({ showSound: e.target.checked });
          showToast(`독음 상시 표기가 ${e.target.checked ? '켜졌습니다' : '꺼졌습니다'}.`);
        });
      }

      // 데이터 초기화 버튼
      const resetBtn = panel.querySelector('#btn-reset-data');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('모든 학습 데이터와 북마크를 초기화하시겠습니까?')) {
            storage.clearAll();
            location.reload();
          }
        });
      }
    }
  };

  renderArchiveContent();

  // 서브탭 전환
  delegate(container, 'click', '.pill-tab', (e, target) => {
    container.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
    activeArchiveTab = target.dataset.archivetab;
    renderArchiveContent();
  });
};
