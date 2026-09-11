/**
 * dom.js - DOM 조작 및 이벤트 위임 공용 유틸리티 (Rule 1 준수)
 */

/**
 * 단일 요소 선택
 * @param {string} selector 
 * @param {Element|Document} [context=document] 
 * @returns {Element|null}
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * 복수 요소 선택
 * @param {string} selector 
 * @param {Element|Document} [context=document] 
 * @returns {NodeListOf<Element>}
 */
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * HTML 문자열로부터 DOM 엘리먼트 생성
 * @param {string} html 
 * @returns {Element}
 */
export const createElementFromHTML = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
};

/**
 * 이벤트 위임 헬퍼
 * @param {Element} targetEl 부모 엘리먼트
 * @param {string} eventType 이벤트 종류 (e.g. 'click')
 * @param {string} selector 대상 자식 셀렉터
 * @param {Function} handler 콜백 핸들러
 */
export const delegate = (targetEl, eventType, selector, handler) => {
  targetEl.addEventListener(eventType, (e) => {
    const matched = e.target.closest(selector);
    if (matched && targetEl.contains(matched)) {
      handler(e, matched);
    }
  });
};

/**
 * 간단한 토스트 알림 표시
 * @param {string} message 
 * @param {number} [duration=2000] 
 */
export const showToast = (message, duration = 2000) => {
  let toast = $('#global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  
  if (toast._timer) clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
};
