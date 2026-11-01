import { describe, expect, it } from 'vitest';
import { createInitialState, progressFor, sessionReducer } from './session';

const order = ['card-1', 'card-2', 'card-3'];
const otherOrder = ['other-1', 'other-2'];

function answer(state: ReturnType<typeof createInitialState>, correct: boolean, objectiveId = 'obj-1', cardId = 'card-1') {
  return sessionReducer(state, {
    type: 'ANSWER',
    optionId: correct ? 'a' : 'b',
    correct,
    objectiveId,
    cardId,
    questionId: 'q-1',
  });
}

describe('sessionReducer', () => {
  it('starts at theory', () => {
    const state = sessionReducer(createInitialState(order), { type: 'START' });
    expect(state.screen).toBe('theory');
    expect(state.started).toBe(true);
  });

  it('first correct answer reveals feedback and awards 10 xp', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, true);
    expect(state.screen).toBe('feedback');
    expect(state.feedback?.correct).toBe(true);
    expect(state.feedback?.reveal).toBe(true);
    expect(state.xp).toBe(10);
    expect(state.mastery['obj-1']).toBe('developing');
  });

  it('first wrong answer does not reveal correct answer and queues review', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, false);
    expect(state.feedback?.correct).toBe(false);
    expect(state.feedback?.reveal).toBe(false);
    expect(state.reviewQueue).toContain('card-1');
    expect(state.mastery['obj-1']).toBe('needs_review');
    expect(state.xp).toBe(0);
  });

  it('second correct answer after review reveals and awards 5 xp', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, false);
    state = sessionReducer(state, { type: 'OPEN_REVIEW', cardId: 'card-1' });
    expect(state.screen).toBe('review');
    expect(state.reviewQueue).not.toContain('card-1');
    state = sessionReducer(state, { type: 'REVIEW_TO_QUESTION' });
    state = answer(state, true);
    expect(state.feedback?.reveal).toBe(true);
    expect(state.xp).toBe(5);
    expect(state.mastery['obj-1']).toBe('developing');
  });

  it('second wrong answer reveals correct answer', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, false);
    state = sessionReducer(state, { type: 'OPEN_REVIEW', cardId: 'card-1' });
    state = sessionReducer(state, { type: 'REVIEW_TO_QUESTION' });
    state = answer(state, false);
    expect(state.feedback?.reveal).toBe(true);
    expect(state.reviewQueue).toContain('card-1');
  });

  it('continuing after wrong answer advances but keeps review queue', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, false);
    state = sessionReducer(state, { type: 'CONTINUE_AFTER_WRONG' });
    expect(state.screen).toBe('theory');
    expect(state.index).toBe(1);
    expect(state.reviewQueue).toContain('card-1');
  });

  it('summary can start review queue', () => {
    let state = createInitialState(['card-1']);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, false);
    state = sessionReducer(state, { type: 'CONTINUE_AFTER_WRONG' });
    expect(state.screen).toBe('summary');
    state = sessionReducer(state, { type: 'START_REVIEW_QUEUE' });
    expect(state.screen).toBe('theory');
    expect(state.order).toEqual(['card-1']);
    expect(state.reviewQueue).toEqual([]);
  });
  it('starts at landing, opens subject home, and can return to landing', () => {
    let state = createInitialState(order);
    expect(state.screen).toBe('landing');
    state = sessionReducer(state, { type: 'OPEN_SUBJECT' });
    expect(state.screen).toBe('home');
    state = sessionReducer(state, { type: 'GO_LANDING' });
    expect(state.screen).toBe('landing');
  });

  it('leaving theory to landing preserves the exact place and resume returns to it', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, true);
    state = sessionReducer(state, { type: 'NEXT' });
    expect(state.screen).toBe('theory');
    expect(state.index).toBe(1);
    state = sessionReducer(state, { type: 'GO_LANDING' });
    expect(state.screen).toBe('landing');
    expect(state.resumeScreen).toBe('theory');
    expect(state.index).toBe(1);
    expect(state.xp).toBe(10);
    state = sessionReducer(state, { type: 'RESUME_STUDY' });
    expect(state.screen).toBe('theory');
    expect(state.index).toBe(1);
    expect(state.xp).toBe(10);
    expect(state.resumeScreen).toBeNull();
  });

  it('starting over from the resume prompt resets progress', () => {
    let state = createInitialState(order);
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, true);
    state = sessionReducer(state, { type: 'GO_LANDING' });
    state = sessionReducer(state, { type: 'START' });
    expect(state.screen).toBe('theory');
    expect(state.index).toBe(0);
    expect(state.xp).toBe(0);
    expect(state.resumeScreen).toBeNull();
  });
});

describe('multiple subjects', () => {
  it('switching subjects keeps independent progress and resume place', () => {
    let state = createInitialState(order, 'physiology');
    state = sessionReducer(state, { type: 'OPEN_SUBJECT', subjectId: 'physiology', baseOrder: order });
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, true);
    state = sessionReducer(state, { type: 'NEXT' });
    expect(state.index).toBe(1);
    state = sessionReducer(state, { type: 'GO_LANDING' });

    state = sessionReducer(state, { type: 'OPEN_SUBJECT', subjectId: 'tourism', baseOrder: otherOrder });
    expect(state.subjectId).toBe('tourism');
    expect(state.screen).toBe('home');
    expect(state.started).toBe(false);
    expect(state.xp).toBe(0);
    expect(progressFor(state, 'physiology')?.xp).toBe(10);
    expect(progressFor(state, 'physiology')?.index).toBe(1);

    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, true, 'tour-obj', 'other-1');
    expect(state.xp).toBe(10);
    state = sessionReducer(state, { type: 'GO_LANDING' });

    state = sessionReducer(state, { type: 'OPEN_SUBJECT', subjectId: 'physiology', baseOrder: order });
    expect(state.subjectId).toBe('physiology');
    expect(state.xp).toBe(10);
    expect(state.index).toBe(1);
    state = sessionReducer(state, { type: 'RESUME_STUDY' });
    expect(state.screen).toBe('theory');
    expect(state.index).toBe(1);
    expect(progressFor(state, 'tourism')?.xp).toBe(10);
  });

  it('reset affects only the active subject', () => {
    let state = createInitialState(order, 'physiology');
    state = sessionReducer(state, { type: 'OPEN_SUBJECT', subjectId: 'physiology', baseOrder: order });
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'TO_QUESTION' });
    state = answer(state, true);
    state = sessionReducer(state, { type: 'GO_LANDING' });
    state = sessionReducer(state, { type: 'OPEN_SUBJECT', subjectId: 'tourism', baseOrder: otherOrder });
    state = sessionReducer(state, { type: 'START' });
    state = sessionReducer(state, { type: 'RESET' });
    expect(state.subjectId).toBe('tourism');
    expect(state.started).toBe(false);
    expect(state.xp).toBe(0);
    expect(progressFor(state, 'physiology')?.xp).toBe(10);
  });
});

describe('delayed checks', () => {
  function startDelayed() {
    return sessionReducer(createInitialState(order), {
      type: 'START_DELAYED',
      questionIds: ['d-1', 'd-2'],
    });
  }

  it('starts directly at a delayed question without theory', () => {
    const state = startDelayed();
    expect(state.screen).toBe('delayed_question');
    expect(state.delayedOrder).toEqual(['d-1', 'd-2']);
  });

  it('correct delayed answer marks confident and awards activity points', () => {
    let state = startDelayed();
    state = sessionReducer(state, {
      type: 'ANSWER_DELAYED',
      optionId: 'a',
      correct: true,
      objectiveId: 'obj-1',
      cardId: 'card-1',
      questionId: 'd-1',
    });
    expect(state.screen).toBe('delayed_feedback');
    expect(state.mastery['obj-1']).toBe('confident');
    expect(state.xp).toBe(5);
    expect(state.delayedResults['d-1']).toBe(true);
  });

  it('wrong delayed answer queues review and does not mark confident', () => {
    let state = startDelayed();
    state = sessionReducer(state, {
      type: 'ANSWER_DELAYED',
      optionId: 'b',
      correct: false,
      objectiveId: 'obj-1',
      cardId: 'card-1',
      questionId: 'd-1',
    });
    expect(state.mastery['obj-1']).toBe('needs_review');
    expect(state.reviewQueue).toContain('card-1');
    expect(state.delayedResults['d-1']).toBe(false);
  });

  it('advances through delayed questions to delayed summary', () => {
    let state = startDelayed();
    state = sessionReducer(state, { type: 'NEXT_DELAYED' });
    expect(state.screen).toBe('delayed_question');
    expect(state.delayedIndex).toBe(1);
    state = sessionReducer(state, { type: 'NEXT_DELAYED' });
    expect(state.screen).toBe('delayed_summary');
  });
});
