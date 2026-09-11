/**
 * store.js - 중앙 반응형 상태 관리자 (Rule 1 준수)
 */

import { storage } from './common/storage.js';

class AppStore {
  constructor() {
    this.state = {
      poems: [],
      authors: [],
      bookmarks: storage.get('bookmarks', []),
      vocabulary: storage.get('vocabulary', []),
      lastReadPoemId: storage.get('last_read_id', 'sh-001'),
      settings: storage.get('settings', {
        fontSize: 'md', // 'sm' | 'md' | 'lg'
        showSound: true, // 독음 표기 여부
        autoVoice: false
      }),
      activeTab: 'home',
      currentStudyPoemId: 'sh-001'
    };

    this.listeners = new Set();
  }

  /**
   * 상태 변경 구독
   * @param {Function} listener 
   * @returns {Function} unsubscribe
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  setPoems(poems) {
    this.state.poems = poems;
    this.notify();
  }

  setAuthors(authors) {
    this.state.authors = authors;
    this.notify();
  }

  setActiveTab(tabName, paramId = null) {
    this.state.activeTab = tabName;
    if (paramId) {
      this.state.currentStudyPoemId = paramId;
      this.setLastReadPoem(paramId);
    }
    this.notify();
  }

  setLastReadPoem(poemId) {
    this.state.lastReadPoemId = poemId;
    storage.set('last_read_id', poemId);
    this.notify();
  }

  toggleBookmark(poemId) {
    const idx = this.state.bookmarks.indexOf(poemId);
    if (idx > -1) {
      this.state.bookmarks.splice(idx, 1);
    } else {
      this.state.bookmarks.push(poemId);
    }
    storage.set('bookmarks', this.state.bookmarks);
    this.notify();
    return this.isBookmarked(poemId);
  }

  isBookmarked(poemId) {
    return this.state.bookmarks.includes(poemId);
  }

  addVocabulary(word) {
    if (!this.state.vocabulary.some(w => w.char === word.char)) {
      this.state.vocabulary.unshift(word);
      storage.set('vocabulary', this.state.vocabulary);
      this.notify();
      return true;
    }
    return false;
  }

  removeVocabulary(char) {
    this.state.vocabulary = this.state.vocabulary.filter(w => w.char !== char);
    storage.set('vocabulary', this.state.vocabulary);
    this.notify();
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    storage.set('settings', this.state.settings);
    this.notify();
  }

  getPoemById(id) {
    return this.state.poems.find(p => p.id === id) || this.state.poems[0];
  }
}

export const store = new AppStore();
