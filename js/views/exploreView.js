/**
 * exploreView.js - [탐색] 목차, 작가별 필터 및 실시간 검색 뷰 모듈
 */

import { store } from '../store.js';
import { delegate, showToast } from '../common/dom.js';

let currentFilter = 'all';
let currentSearchQuery = '';

export const renderExploreView = (container) => {
  const { poems, authors } = store.state;

  const renderList = () => {
    const listEl = container.querySelector('#explore-poem-list');
    if (!listEl) return;

    const filtered = poems.filter(p => {
      // 1. 카테고리/작가 필터
      let matchFilter = true;
      if (currentFilter !== 'all') {
        if (currentFilter.startsWith('author:')) {
          const authorId = currentFilter.replace('author:', '');
          matchFilter = p.author_id === authorId;
        } else if (currentFilter.startsWith('form:')) {
          const form = currentFilter.replace('form:', '');
          matchFilter = p.form === form;
        }
      }

      // 2. 검색어 필터
      let matchQuery = true;
      if (currentSearchQuery.trim()) {
        const q = currentSearchQuery.trim().toLowerCase();
        const inTitleHanja = p.title_hanja.toLowerCase().includes(q);
        const inTitleKo = p.title_ko.toLowerCase().includes(q);
        const inAuthor = p.author_name.toLowerCase().includes(q);
        const inLines = p.lines.some(l => 
          l.hanja.toLowerCase().includes(q) || 
          l.hangeul.toLowerCase().includes(q) || 
          l.meaning.toLowerCase().includes(q)
        );
        matchQuery = inTitleHanja || inTitleKo || inAuthor || inLines;
      }

      return matchFilter && matchQuery;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--color-ink-muted);">
          <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
          <p style="font-size: 14px;">검색 결과가 없습니다.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(p => {
      const isBookmarked = store.isBookmarked(p.id);
      return `
        <div class="item-card" data-poem-id="${p.id}">
          <div class="item-card-left">
            <div class="item-title-row">
              <span class="item-title-hanja">${p.title_hanja}</span>
              <span class="item-title-ko">${p.title_ko}</span>
            </div>
            <div class="item-meta">
              ${p.author_name} · ${p.form}
            </div>
          </div>
          <button class="btn-bookmark btn-icon" data-id="${p.id}" title="북마크" style="background: none; width: 36px; height: 36px;">
            <svg width="20" height="20" fill="${isBookmarked ? 'var(--color-primary)' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  };

  const authorTabs = authors && authors.length > 0 
    ? authors.map(a => `
        <button class="pill-tab ${currentFilter === `author:${a.id}` ? 'active' : ''}" data-filter="author:${a.id}">
          ${a.name.split(' ')[0]}
        </button>
      `).join('')
    : '';

  container.innerHTML = `
    <div class="view-explore animate-fade-in">
      <div style="margin-bottom: 16px;">
        <span class="eyebrow">EXPLORE 20 POEMS</span>
        <h2 style="font-size: 20px; font-weight: 800; letter-spacing: -0.4px;">작품 탐색 (총 20수)</h2>
      </div>

      <!-- 실시간 검색창 -->
      <div class="search-wrapper">
        <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="explore-search-input" class="search-input" placeholder="시제, 작가명, 구절(한자/한글) 검색..." value="${currentSearchQuery}" />
      </div>

      <!-- 필터 탭 (Pill Tabs) -->
      <div class="pill-tabs-container">
        <button class="pill-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">전체 (20)</button>
        ${authorTabs}
        <button class="pill-tab ${currentFilter === 'form:5언절구' ? 'active' : ''}" data-filter="form:5언절구">5언절구</button>
        <button class="pill-tab ${currentFilter === 'form:7언절구' ? 'active' : ''}" data-filter="form:7언절구">7언절구</button>
        <button class="pill-tab ${currentFilter === 'form:5언율시' ? 'active' : ''}" data-filter="form:5언율시">5언율시</button>
        <button class="pill-tab ${currentFilter === 'form:7언율시' ? 'active' : ''}" data-filter="form:7언율시">7언율시</button>
      </div>

      <!-- 시 목록 -->
      <div id="explore-poem-list"></div>
    </div>
  `;

  renderList();

  // 검색 인풋 이벤트
  const searchInput = container.querySelector('#explore-search-input');
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderList();
  });

  // 필터 탭 클릭
  delegate(container, 'click', '.pill-tab', (e, target) => {
    container.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
    currentFilter = target.dataset.filter;
    renderList();
  });

  // 북마크 클릭
  delegate(container, 'click', '.btn-bookmark', (e, target) => {
    e.stopPropagation();
    const id = target.dataset.id;
    const isAdded = store.toggleBookmark(id);
    showToast(isAdded ? '보관함에 저장되었습니다. 🔖' : '보관함에서 제거되었습니다.');
    renderList();
  });

  // 카드 클릭 시 학습 모드로 이동
  delegate(container, 'click', '.item-card', (e, target) => {
    const poemId = target.dataset.poemId;
    window.location.hash = `study?id=${poemId}`;
  });
};
