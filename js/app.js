/**
 * app.js - 애플리케이션 진입점 및 전역 오케스트레이터 (Rule 1 준수)
 */

import { store } from './store.js';
import { HashRouter } from './router.js';
import { renderHomeView } from './views/homeView.js';
import { renderExploreView } from './views/exploreView.js';
import { renderStudyView } from './views/studyView.js';
import { renderArchiveView } from './views/archiveView.js';
import { $, $$ } from './common/dom.js';

class App {
  async init() {
    // 1. 데이터 로드 (poems.json, authors.json)
    await this.loadInitialData();

    // 2. 뷰 컨테이너 선택
    const viewContainer = $('#view-container');

    // 3. 라우터 설정 및 뷰 매핑
    this.router = new HashRouter({
      home: () => {
        this.updateNavState('home');
        renderHomeView(viewContainer);
      },
      explore: () => {
        this.updateNavState('explore');
        renderExploreView(viewContainer);
      },
      study: () => {
        this.updateNavState('study');
        renderStudyView(viewContainer);
      },
      archive: () => {
        this.updateNavState('archive');
        renderArchiveView(viewContainer);
      }
    });

    // 4. 하단 탭 내비게이션 클릭 이벤트 바인딩
    this.bindNavEvents();

    // 5. 초기 라우트 기동
    this.router.init();
  }

  async loadInitialData() {
    try {
      const [poemsRes, authorsRes] = await Promise.all([
        fetch('./js/data/poems.json'),
        fetch('./js/data/authors.json')
      ]);

      if (poemsRes.ok && authorsRes.ok) {
        const poems = await poemsRes.json();
        const authors = await authorsRes.json();
        store.setPoems(poems);
        store.setAuthors(authors);
        return;
      }
    } catch (err) {
      console.warn('[Data Load Note] Direct file fetch fallback activated.', err);
    }
  }

  updateNavState(activeTab) {
    $$('.nav-item').forEach(el => {
      if (el.dataset.tab === activeTab) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  bindNavEvents() {
    $$('.nav-item').forEach(el => {
      el.addEventListener('click', () => {
        const tab = el.dataset.tab;
        this.router.navigate(tab);
      });
    });
  }
}

// DOM 준비 완료 시 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
