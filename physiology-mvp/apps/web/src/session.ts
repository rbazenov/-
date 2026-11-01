import type { Mastery, SessionState, StudyProgress } from './types';

export const DELAYED_CHECK_DELAY_MS = 24 * 60 * 60 * 1000;

export type SessionAction =
  | { type: 'OPEN_SUBJECT'; subjectId?: string; baseOrder?: string[] }
  | { type: 'GO_LANDING' }
  | { type: 'RESUME_STUDY' }
  | { type: 'START' }
  | { type: 'TO_QUESTION' }
  | { type: 'ANSWER'; optionId: string; correct: boolean; objectiveId: string; cardId: string; questionId: string }
  | { type: 'OPEN_REVIEW'; cardId: string }
  | { type: 'CONTINUE_AFTER_WRONG' }
  | { type: 'REVIEW_TO_QUESTION' }
  | { type: 'NEXT' }
  | { type: 'START_REVIEW_QUEUE' }
  | { type: 'START_DELAYED'; questionIds: string[] }
  | { type: 'ANSWER_DELAYED'; optionId: string; correct: boolean; objectiveId: string; cardId: string; questionId: string }
  | { type: 'NEXT_DELAYED' }
  | { type: 'GO_HOME' }
  | { type: 'RESET' };

export function createProgress(baseOrder: string[]): StudyProgress {
  return {
    screen: 'landing',
    baseOrder,
    order: baseOrder,
    index: 0,
    selectedOptionId: null,
    attempts: {},
    feedback: null,
    reviewQueue: [],
    xp: 0,
    mastery: {},
    started: false,
    learningCompletedAt: null,
    delayedOrder: [],
    delayedIndex: 0,
    delayedResults: {},
    delayedFeedback: null,
    resumeScreen: null,
  };
}

export function createInitialState(baseOrder: string[], subjectId = 'physiology'): SessionState {
  return { ...createProgress(baseOrder), subjectId, saved: {} };
}

export function toProgress(state: SessionState): StudyProgress {
  const { subjectId: _subjectId, saved: _saved, ...progress } = state;
  return progress;
}

export function progressFor(state: SessionState, subjectId: string): StudyProgress | undefined {
  if (state.subjectId === subjectId) return toProgress(state);
  return state.saved[subjectId];
}

function uniquePush(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

function advance(state: SessionState): SessionState {
  const nextIndex = state.index + 1;
  if (nextIndex < state.order.length) {
    return { ...state, screen: 'theory', index: nextIndex, selectedOptionId: null, feedback: null };
  }
  return {
    ...state,
    screen: 'summary',
    selectedOptionId: null,
    feedback: null,
    learningCompletedAt: state.learningCompletedAt ?? Date.now(),
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'OPEN_SUBJECT': {
      const subjectId = action.subjectId ?? state.subjectId;
      if (subjectId === state.subjectId) {
        return { ...state, screen: 'home' };
      }
      const saved: Record<string, StudyProgress> = {
        ...state.saved,
        [state.subjectId]: toProgress(state),
      };
      const target = saved[subjectId] ?? createProgress(action.baseOrder ?? []);
      delete saved[subjectId];
      return {
        ...target,
        subjectId,
        baseOrder: action.baseOrder ?? target.baseOrder,
        order: target.started ? target.order : (action.baseOrder ?? target.baseOrder),
        saved,
        screen: 'home',
      };
    }
    case 'GO_LANDING':
      return {
        ...state,
        screen: 'landing',
        resumeScreen: state.screen === 'landing' ? state.resumeScreen : state.screen,
      };
    case 'RESUME_STUDY': {
      let target: SessionState['screen'] = state.resumeScreen && state.resumeScreen !== 'landing'
        ? state.resumeScreen
        : state.started
          ? (state.learningCompletedAt != null ? 'summary' : 'theory')
          : 'home';
      if ((target === 'feedback' || target === 'review') && !state.feedback) target = 'theory';
      if (target === 'question' && !state.order[state.index]) target = 'home';
      if ((target === 'delayed_question' || target === 'delayed_feedback') && state.delayedOrder.length === 0) target = 'home';
      if (target === 'delayed_feedback' && !state.delayedFeedback) target = 'delayed_question';
      return { ...state, screen: target, resumeScreen: null };
    }
    case 'START':
      return { ...createInitialState(state.baseOrder, state.subjectId), saved: state.saved, screen: 'theory', started: true };
    case 'TO_QUESTION':
      return { ...state, screen: 'question', selectedOptionId: null, feedback: null };
    case 'ANSWER': {
      const previousAttempts = state.attempts[action.objectiveId] ?? 0;
      const attempts = { ...state.attempts, [action.objectiveId]: previousAttempts + 1 };
      const mastery: Record<string, Mastery> = { ...state.mastery };
      let xp = state.xp;
      let reviewQueue = state.reviewQueue;
      let reveal = false;
      if (action.correct) {
        xp += previousAttempts === 0 ? 10 : 5;
        mastery[action.objectiveId] = 'developing';
        reveal = true;
      } else {
        mastery[action.objectiveId] = 'needs_review';
        reveal = previousAttempts >= 1;
        reviewQueue = uniquePush(reviewQueue, action.cardId);
      }
      return {
        ...state,
        screen: 'feedback',
        selectedOptionId: action.optionId,
        attempts,
        xp,
        mastery,
        reviewQueue,
        feedback: {
          questionId: action.questionId,
          optionId: action.optionId,
          correct: action.correct,
          reveal,
          objectiveId: action.objectiveId,
          cardId: action.cardId,
        },
      };
    }
    case 'OPEN_REVIEW':
      return {
        ...state,
        screen: 'review',
        reviewQueue: state.reviewQueue.filter((id) => id !== action.cardId),
      };
    case 'CONTINUE_AFTER_WRONG':
      return advance(state);
    case 'REVIEW_TO_QUESTION':
      return { ...state, screen: 'question', selectedOptionId: null, feedback: null };
    case 'NEXT':
      return advance(state);
    case 'START_REVIEW_QUEUE': {
      if (state.reviewQueue.length === 0) return state;
      return {
        ...state,
        screen: 'theory',
        order: state.reviewQueue,
        reviewQueue: [],
        index: 0,
        feedback: null,
        selectedOptionId: null,
        started: true,
      };
    }
    case 'START_DELAYED': {
      if (action.questionIds.length === 0) return state;
      return {
        ...state,
        screen: 'delayed_question',
        delayedOrder: action.questionIds,
        delayedIndex: 0,
        delayedResults: {},
        delayedFeedback: null,
        selectedOptionId: null,
        feedback: null,
      };
    }
    case 'ANSWER_DELAYED': {
      const mastery: Record<string, Mastery> = { ...state.mastery };
      let reviewQueue = state.reviewQueue;
      if (action.correct) {
        mastery[action.objectiveId] = 'confident';
      } else {
        mastery[action.objectiveId] = 'needs_review';
        reviewQueue = uniquePush(reviewQueue, action.cardId);
      }
      return {
        ...state,
        screen: 'delayed_feedback',
        xp: state.xp + (action.correct ? 5 : 0),
        mastery,
        reviewQueue,
        delayedResults: { ...state.delayedResults, [action.questionId]: action.correct },
        delayedFeedback: {
          questionId: action.questionId,
          optionId: action.optionId,
          correct: action.correct,
          reveal: true,
          objectiveId: action.objectiveId,
          cardId: action.cardId,
        },
      };
    }
    case 'NEXT_DELAYED': {
      const nextIndex = state.delayedIndex + 1;
      if (nextIndex < state.delayedOrder.length) {
        return { ...state, screen: 'delayed_question', delayedIndex: nextIndex, delayedFeedback: null };
      }
      return { ...state, screen: 'delayed_summary', delayedFeedback: null };
    }
    case 'GO_HOME':
      return { ...state, screen: 'home', feedback: null, delayedFeedback: null };
    case 'RESET':
      return { ...createInitialState(state.baseOrder, state.subjectId), saved: state.saved };
    default:
      return state;
  }
}

export function masteryLabel(value: Mastery | undefined): string {
  switch (value) {
    case 'developing':
      return 'Закрепляется';
    case 'needs_review':
      return 'Нужно повторить';
    case 'confident':
      return 'Уверенно (отложенная проверка)';
    default:
      return 'Не изучено';
  }
}
