/**
 * date.js - 날짜 및 학습 스트릭 계산 공용 유틸리티 (Rule 1 준수)
 */

import { storage } from './storage.js';

/**
 * YYYY-MM-DD 형식의 오늘 날짜 반환
 * @returns {string}
 */
export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 오늘 날짜를 기반으로 일관된 시 인덱스(0 ~ totalPoems-1)를 반환
 * @param {number} totalCount 
 * @returns {number}
 */
export const getDailyPoemIndex = (totalCount) => {
  if (totalCount <= 0) return 0;
  const today = getTodayString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % totalCount;
};

/**
 * 출석 스트릭(연속 학습일) 계산 및 갱신
 * @returns {{ count: number, isNewToday: boolean }}
 */
export const updateDailyStreak = () => {
  const today = getTodayString();
  const streakData = storage.get('streak', { count: 1, lastDate: today });

  if (streakData.lastDate === today) {
    return { count: streakData.count, isNewToday: false };
  }

  const last = new Date(streakData.lastDate);
  const current = new Date(today);
  const diffDays = Math.round((current - last) / (1000 * 60 * 60 * 24));

  let newCount = streakData.count;
  if (diffDays === 1) {
    newCount += 1;
  } else if (diffDays > 1) {
    newCount = 1; // 연속 출석 끊김 리셋
  }

  storage.set('streak', { count: newCount, lastDate: today });
  return { count: newCount, isNewToday: true };
};
