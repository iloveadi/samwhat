/**
 * router.js - 경량 해시(#) 라우터 모듈 (Rule 1 준수)
 */

import { store } from './store.js';

export class HashRouter {
  constructor(routes) {
    this.routes = routes;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  /**
   * 해시 변경 처리
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    const poemId = params.get('id');
    const validTabs = ['home', 'explore', 'study', 'archive'];
    const currentTab = validTabs.includes(path) ? path : 'home';

    store.setActiveTab(currentTab, poemId);

    if (this.routes[currentTab]) {
      this.routes[currentTab]({ path, params, poemId });
    }
  }

  /**
   * 특정 라우트로 이동
   * @param {string} tab 
   * @param {Object} [params] 
   */
  navigate(tab, params = {}) {
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `${tab}?${query}` : tab;
  }

  init() {
    this.handleRoute();
  }
}
