/**
 * storage.js - LocalStorage 데이터 영속성 관리 공용 유틸리티 (Rule 1 준수)
 */

const STORAGE_PREFIX = 'samhan_';

export const storage = {
  /**
   * 로컬 스토리지에 JSON 데이터 저장
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[Storage Set Error: ${key}]`, err);
      return false;
    }
  },

  /**
   * 로컬 스토리지에서 JSON 데이터 조회
   * @param {string} key 
   * @param {any} defaultValue 기본값
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`[Storage Get Error: ${key}]`, err);
      return defaultValue;
    }
  },

  /**
   * 항목 제거
   * @param {string} key 
   */
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.error(`[Storage Remove Error: ${key}]`, err);
    }
  },

  /**
   * 전체 서비스 데이터 초기화
   */
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(STORAGE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (err) {
      console.error('[Storage Clear Error]', err);
    }
  }
};
