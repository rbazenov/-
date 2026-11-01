import { useEffect, useRef, useState } from 'react';
import { get, set } from 'idb-keyval';
import {
  getSubject,
  questionForAttempt,
  subjects,
  type Subject,
} from './content';
import {
  createInitialState,
  DELAYED_CHECK_DELAY_MS,
  masteryLabel,
  progressFor,
  sessionReducer,
  type SessionAction,
} from './session';
import type { Attribution, Card, Question, SessionState, SourceRef } from './types';

const STORAGE_KEY = 'study-mvp-session-v3';
const LEGACY_STORAGE_KEY = 'physiology-mvp-session-v2';
const SWIPE_HINT_KEY = 'study-mvp-swipe-hint-v1';
/* Подсказка-жест: две итерации по 2,6 с плюс затухание. */
const SWIPE_HINT_DURATION_MS = 5400;
const embeddedPreview = import.meta.env.VITE_PREVIEW_MODE === 'standalone';
const defaultSubject = subjects[0];

/* Подсказку о свайпе показываем только новому посетителю: отметка живёт в localStorage. */
function hasSeenSwipeHint(): boolean {
  try {
    return window.localStorage.getItem(SWIPE_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

function markSwipeHintSeen() {
  try {
    window.localStorage.setItem(SWIPE_HINT_KEY, '1');
  } catch {
    // Приватный режим или запрещённое хранилище: подсказка просто покажется ещё раз.
  }
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function AttributionBlock({ attribution, sourceRefs }: { attribution: Attribution; sourceRefs?: SourceRef[] }) {
  const extraRefs = (sourceRefs ?? []).filter((ref) => ref.url !== attribution.chapter_url);
  return (
    <details className="attribution">
      <summary>Источник, лицензия и изменения</summary>
      <p>
        {attribution.source_title}
        {attribution.editor ? ` / ред. ${attribution.editor}` : ''}. {attribution.publisher}, {attribution.year}.
      </p>
      <p>{attribution.copyright_notice}</p>
      <p>
        Лицензия: <a href={attribution.license_url} target="_blank" rel="noreferrer">{attribution.license}</a>.{' '}
        <a href={attribution.chapter_url} target="_blank" rel="noreferrer">Раздел источника</a>.
      </p>
      <p className="notice">{attribution.required_notice}</p>
      <p>{attribution.changes_ru}</p>
      <p>{attribution.no_endorsement_ru}</p>
      {extraRefs.length > 0 && (
        <p>
          Дополнительные источники:{' '}
          {extraRefs.map((ref, i) => (
            <span key={`${ref.source_id}-${i}`}>
              {i > 0 ? '; ' : ''}
              <a href={ref.url} target="_blank" rel="noreferrer">{ref.title ?? ref.source_id}</a>
              {ref.locator ? ` (${ref.locator})` : ''}
            </span>
          ))}
        </p>
      )}
    </details>
  );
}

function SwipeHint() {
  return (
    <div className="swipe-hint" aria-hidden="true" data-testid="swipe-hint">
      <span className="swipe-hint-trail" />
      <span className="swipe-hint-dot" />
    </div>
  );
}

function KeyChain({ items }: { items: string[] }) {
  return (
    <ol className="chain" aria-label="Причинная цепочка">
      {items.map((item, i) => (
        <li key={item}>{item}{i < items.length - 1 ? <span aria-hidden="true"> →</span> : null}</li>
      ))}
    </ol>
  );
}

function OptionResult({ question, feedback }: { question: Question; feedback: NonNullable<SessionState['feedback']> }) {
  const selectedOption = question.options.find((o) => o.option_id === feedback.optionId);
  const correctOption = question.options.find((o) => o.is_correct);
  return (
    <>
      <div className="options" aria-label="Результат ответа">
        {question.options.map((option) => {
          const selected = option.option_id === feedback.optionId;
          const showCorrect = feedback.reveal && option.is_correct;
          const cls = ['option', 'static'];
          if (selected) cls.push('chosen');
          if (selected && feedback.correct) cls.push('correct');
          if (selected && !feedback.correct) cls.push('wrong');
          if (showCorrect && !selected) cls.push('correct');
          return (
            <div key={option.option_id} className={cls.join(' ')}>
              <span className="option-id">{option.option_id.toUpperCase()}</span>
              <span>
                {option.text_ru}
                {selected && <em className="tag">Ваш ответ</em>}
                {showCorrect && !selected && <em className="tag">Правильный ответ</em>}
              </span>
            </div>
          );
        })}
      </div>
      {feedback.reveal && selectedOption && (
        <div className="explain">
          <strong>{feedback.correct ? 'Почему верно' : 'Разбор выбранного варианта'}</strong>
          <p>{selectedOption.explanation_ru}</p>
          {!feedback.correct && correctOption && (
            <>
              <strong>Правильный ответ</strong>
              <p>{correctOption.explanation_ru}</p>
            </>
          )}
        </div>
      )}
    </>
  );
}

function isSessionState(value: unknown): value is SessionState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<SessionState>;
  return typeof v.subjectId === 'string' && Array.isArray(v.order) && typeof v.screen === 'string' && !!v.saved && typeof v.saved === 'object';
}

function migrateLegacy(value: unknown): SessionState | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<SessionState>;
  if (!Array.isArray(v.order) || typeof v.screen !== 'string') return null;
  const base = createInitialState(defaultSubject.baseOrder, defaultSubject.id);
  const resumeScreen = v.screen !== 'landing' ? v.screen : (v.resumeScreen ?? null);
  return { ...base, ...v, subjectId: defaultSubject.id, saved: {}, screen: 'landing', resumeScreen };
}

export default function App() {
  const [state, setState] = useState<SessionState>(() => createInitialState(defaultSubject.baseOrder, defaultSubject.id));
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [swipeHintVisible, setSwipeHintVisible] = useState(false);
  const swipeHintShown = useRef(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (embeddedPreview) {
      setHydrated(true);
      return;
    }
    let active = true;
    get<SessionState>(STORAGE_KEY)
      .then(async (saved) => {
        if (!active) return;
        if (isSessionState(saved) && subjects.some((s) => s.id === saved.subjectId)) {
          setState({ ...createInitialState(getSubject(saved.subjectId).baseOrder, saved.subjectId), ...saved });
          return;
        }
        const legacy = await get<unknown>(LEGACY_STORAGE_KEY);
        const migrated = migrateLegacy(legacy);
        if (active && migrated) setState(migrated);
      })
      .catch(() => undefined)
      .finally(() => active && setHydrated(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (hydrated && !embeddedPreview) void set(STORAGE_KEY, state).catch(() => undefined);
  }, [state, hydrated]);

  // Первый показ теории: один раз на браузер объясняем свайп жестом пальца.
  useEffect(() => {
    if (state.screen !== 'theory') {
      setSwipeHintVisible(false);
      return;
    }
    if (swipeHintShown.current || hasSeenSwipeHint() || prefersReducedMotion()) return;
    swipeHintShown.current = true;
    markSwipeHintSeen();
    setSwipeHintVisible(true);
    const id = window.setTimeout(() => setSwipeHintVisible(false), SWIPE_HINT_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [state.screen]);

  const dispatch = (action: SessionAction) => setState((s) => sessionReducer(s, action));
  const subject = getSubject(state.subjectId);
  const cards = subject.cards;
  const questions = subject.questions;
  const delayedQuestions = subject.delayedQuestions;

  const reset = () => {
    setResumePromptOpen(false);
    dispatch({ type: 'RESET' });
  };

  const enterSubject = (target: Subject) => {
    const targetProgress = progressFor(state, target.id);
    dispatch({ type: 'OPEN_SUBJECT', subjectId: target.id, baseOrder: target.baseOrder });
    if (targetProgress?.started) setResumePromptOpen(true);
  };

  const startOrResume = () => {
    if (state.started) {
      setResumePromptOpen(true);
      return;
    }
    dispatch({ type: 'START' });
  };

  const card = cards.find((c) => c.card_id === state.order[state.index]) as Card | undefined;
  const objectiveId = card?.learning_objective_id ?? '';
  const question: Question | undefined = card
    ? questionForAttempt(subject, objectiveId, state.attempts[objectiveId] ?? 0)
    : undefined;
  const feedbackQuestion = state.feedback ? questions.find((q) => q.question_id === state.feedback!.questionId) : undefined;
  const selectedOption = feedbackQuestion?.options.find((o) => o.option_id === state.feedback?.optionId);

  const delayedQuestion = delayedQuestions.find((q) => q.question_id === state.delayedOrder[state.delayedIndex]);
  const delayedFeedbackQuestion = state.delayedFeedback
    ? delayedQuestions.find((q) => q.question_id === state.delayedFeedback!.questionId)
    : undefined;
  const delayedDueAt = state.learningCompletedAt == null ? null : state.learningCompletedAt + DELAYED_CHECK_DELAY_MS;
  const delayedDue = delayedDueAt != null && now >= delayedDueAt;
  const delayedCorrectCount = Object.values(state.delayedResults).filter(Boolean).length;
  const startDelayed = () => dispatch({ type: 'START_DELAYED', questionIds: delayedQuestions.map((q) => q.question_id) });

  // Блок источников один на страницу и стоит у нижней границы экрана.
  const activeAttribution =
    state.screen === 'home' && cards[0]
      ? { attribution: cards[0].attribution, sourceRefs: cards[0].source_refs }
      : state.screen === 'theory' && card
        ? { attribution: card.attribution, sourceRefs: card.source_refs }
        : state.screen === 'question' && question
          ? { attribution: question.attribution, sourceRefs: question.source_refs }
          : state.screen === 'delayed_question' && delayedQuestion
            ? { attribution: delayedQuestion.attribution, sourceRefs: delayedQuestion.source_refs }
            : null;

  const onSwipeStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
    setSwipeHintVisible(false);
  };
  const onSwipeEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const end = e.changedTouches[0]?.clientX ?? touchX.current;
    if (touchX.current - end > 60) dispatch({ type: 'TO_QUESTION' });
    touchX.current = null;
  };

  return (
    <div className={state.screen === 'home' ? 'app app-home' : 'app'}>
      <header className="top">
        <div>
          <p className="eyebrow">{state.screen === 'landing' ? 'Учебный проект' : subject.title}</p>
          {state.screen !== 'landing' && <h1>Карточки и вопросы</h1>}
        </div>
        <div className="top-actions">
          <span className="xp" aria-label="Баллы активности">{state.xp} баллов</span>
          {state.screen === 'home' && (
            <button className="ghost header-back" onClick={() => dispatch({ type: 'GO_LANDING' })}>← Главная</button>
          )}
        </div>
      </header>

      {state.screen === 'landing' && (
        <main className="screen landing">
          <h1>О проекте</h1>
          <p>
            Прототип для студентов физфака ЧГИФК. Студент читает короткую карточку, отвечает на вопрос, разбирает ошибку и возвращается к теме позже.
          </p>
          <ul className="feature-list">
            <li>Теория короткими карточками</li>
            <li>Вопрос сразу после теории</li>
            <li>После ошибки можно продолжить; тема вернётся в повторение</li>
            <li>Баллы показывают активность, а не процент освоения</li>
          </ul>

          <h2>Выбор предмета</h2>
          <div className="subject-list">
            {subjects.map((s) => {
              const progress = progressFor(state, s.id);
              return (
                <div className="subject-card" key={s.id} data-subject-id={s.id}>
                  <div className="subject-head">
                    <strong>{s.title}</strong>
                    <span className={`badge ${s.status === 'draft' ? 'badge-draft' : 'badge-mixed'}`}>
                      {s.status === 'draft' ? 'Черновик' : 'Смешанный статус'}
                    </span>
                  </div>
                  <span className="muted subject-module">{s.moduleTitle}</span>
                  <span className="muted subject-desc">{s.description}</span>
                  {progress?.started && (
                    <span className="muted subject-progress">
                      Прогресс сохранён: {progress.xp} баллов{progress.learningCompletedAt ? ' · сессия завершена' : ''}
                    </span>
                  )}
                  <button className="primary subject-action" onClick={() => enterSubject(s)} aria-label={`Выбрать предмет: ${s.title}`}>
                    {progress?.started ? 'Продолжить предмет' : 'Выбрать предмет'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="hint">
            Новые предметы пока черновики. Их можно давать студентам только после предметной редактуры.
          </p>
        </main>
      )}

      {state.screen === 'home' && (
        <>
          <section className="subject-intro" aria-label="Описание модуля">
            <h2>{subject.moduleTitle}</h2>
            <p>
              {subject.description} После теории — вопрос, затем обратная связь.
            </p>
          </section>
          <main className="screen screen-home">
          <ul className="list scroll topic-grid">
            {cards.map((c) => (
              <li key={c.card_id}>
                <strong>{c.title}</strong>
                <span className="muted">{masteryLabel(state.mastery[c.learning_objective_id])}</span>
              </li>
            ))}
          </ul>
          {state.reviewQueue.length > 0 && (
            <button className="secondary" onClick={() => dispatch({ type: 'START_REVIEW_QUEUE' })}>
              Повторить слабые темы ({state.reviewQueue.length})
            </button>
          )}
          {state.learningCompletedAt != null && (
            <div className="delayed-box">
              <strong>Отложенная проверка</strong>
              <p className="muted">
                {delayedDue
                  ? 'Доступна сейчас. Вопросы идут без предварительной теории.'
                  : `Будет доступна после ${new Date(delayedDueAt!).toLocaleString('ru-RU')}. Интервал задан для пилота и пока не проверен.`}
              </p>
              <button className="primary" onClick={startDelayed} disabled={!delayedDue}>
                Пройти отложенную проверку
              </button>
              <button className="secondary" onClick={startDelayed}>
                Открыть сейчас (демо для редактора)
              </button>
            </div>
          )}
          <button className="primary" onClick={startOrResume}>
            {state.started ? 'Продолжить обучение' : 'Начать'}
          </button>
          </main>
        </>
      )}

      {state.screen === 'theory' && card && (
        <main className="screen card" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd}>
          <button className="ghost back" onClick={() => dispatch({ type: 'GO_LANDING' })}>← На главную</button>
          <p className="step">Теория · {state.index + 1} / {state.order.length}</p>
          <h2>{card.title}</h2>
          <p className="body">{card.body_ru}</p>
          <KeyChain items={card.key_chain_ru} />
          <div className="hint-row">
            {swipeHintVisible && <SwipeHint />}
            <p className="hint">Проведите пальцем влево или нажмите кнопку, чтобы перейти к вопросу.</p>
          </div>
          <button className="primary" onClick={() => dispatch({ type: 'TO_QUESTION' })}>К вопросу</button>
        </main>
      )}

      {state.screen === 'question' && card && question && (
        <main className="screen">
          <p className="step">Вопрос · {card.learning_objective_id}</p>
          <h2>{question.prompt_ru}</h2>
          <div className="options" role="group" aria-label="Варианты ответа">
            {question.options.map((option) => (
              <button
                key={option.option_id}
                className="option"
                onClick={() => dispatch({
                  type: 'ANSWER',
                  optionId: option.option_id,
                  correct: option.is_correct,
                  objectiveId,
                  cardId: card.card_id,
                  questionId: question.question_id,
                })}
              >
                <span className="option-id">{option.option_id.toUpperCase()}</span>
                <span>{option.text_ru}</span>
              </button>
            ))}
          </div>
        </main>
      )}

      {state.screen === 'feedback' && state.feedback && feedbackQuestion && card && (
        <main className="screen">
          <p className="step">Обратная связь</p>
          <h2 className={state.feedback.correct ? 'ok-text' : 'bad-text'}>
            {state.feedback.correct ? 'Верно' : 'Пока неверно'}
          </h2>
          {!state.feedback.correct && !state.feedback.reveal && (
            <p>Правильный ответ пока скрыт. Разберите тему или продолжите; она останется в повторении.</p>
          )}
          {!state.feedback.correct && state.feedback.reveal && (
            <p>После повторной попытки показываем правильный ответ и разбор.</p>
          )}
          {state.feedback.correct && (
            <p>{state.feedback.reveal && (state.attempts[state.feedback.objectiveId] ?? 0) > 1
              ? 'Тема закрепляется, но отложенная проверка ещё нужна.'
              : 'Это тренировочный ответ. Отложенная проверка покажет, сохранилось ли знание.'}</p>
          )}
          <OptionResult question={feedbackQuestion} feedback={state.feedback} />
          <div className="actions">
            {state.feedback.correct && <button className="primary" onClick={() => dispatch({ type: 'NEXT' })}>Дальше</button>}
            {!state.feedback.correct && !state.feedback.reveal && (
              <>
                <button className="primary" onClick={() => dispatch({ type: 'OPEN_REVIEW', cardId: state.feedback!.cardId })}>Разобраться</button>
                <button className="secondary" onClick={() => dispatch({ type: 'CONTINUE_AFTER_WRONG' })}>Продолжить</button>
              </>
            )}
            {!state.feedback.correct && state.feedback.reveal && <button className="primary" onClick={() => dispatch({ type: 'NEXT' })}>Дальше</button>}
          </div>
        </main>
      )}

      {state.screen === 'review' && card && selectedOption && (
        <main className="screen">
          <p className="step">Разбор ошибки</p>
          <h2>{card.title}</h2>
          <p className="body">{card.body_ru}</p>
          <div className="explain">
            <strong>Подсказка к выбранному варианту</strong>
            <p>{selectedOption.hint_ru ?? 'Перечитайте причинную цепочку и попробуйте другой вопрос по этой же цели.'}</p>
          </div>
          <KeyChain items={card.key_chain_ru} />
          <button className="primary" onClick={() => dispatch({ type: 'REVIEW_TO_QUESTION' })}>Проверить ещё раз</button>
        </main>
      )}

      {state.screen === 'summary' && (
        <main className="screen">
          <h2>Итог сессии</h2>
          <p>Баллы активности: <strong>{state.xp}</strong>. Это не процент готовности к экзамену.</p>
          <ul className="list scroll">
            {cards.map((c) => (
              <li key={c.card_id}>
                <strong>{c.title}</strong>
                <span className="muted">{masteryLabel(state.mastery[c.learning_objective_id])}</span>
              </li>
            ))}
          </ul>
          {state.reviewQueue.length > 0 && (
            <button className="primary" onClick={() => dispatch({ type: 'START_REVIEW_QUEUE' })}>
              Повторить слабые темы ({state.reviewQueue.length})
            </button>
          )}
          <div className="delayed-box">
            <strong>Отложенная проверка</strong>
            <p className="muted">
              {delayedDue
                ? 'Доступна сейчас. Это новые вопросы без предварительного показа теории.'
                : `Откроется после ${new Date(delayedDueAt!).toLocaleString('ru-RU')}. Интервал задан для пилота и пока не проверен.`}
            </p>
            <button className="primary" onClick={startDelayed} disabled={!delayedDue}>Пройти отложенную проверку</button>
            <button className="secondary" onClick={startDelayed}>Открыть сейчас (демо для редактора)</button>
          </div>
          <button className="secondary" onClick={() => dispatch({ type: 'START' })}>Начать заново</button>
        </main>
      )}

      {state.screen === 'delayed_question' && delayedQuestion && (
        <main className="screen">
          <p className="step">Отложенная проверка · {state.delayedIndex + 1} / {state.delayedOrder.length}</p>
          <p className="hint">Без предварительной теории. Выберите один лучший ответ.</p>
          <h2>{delayedQuestion.prompt_ru}</h2>
          <div className="options" role="group" aria-label="Варианты ответа">
            {delayedQuestion.options.map((option) => (
              <button
                key={option.option_id}
                className="option"
                onClick={() => dispatch({
                  type: 'ANSWER_DELAYED',
                  optionId: option.option_id,
                  correct: option.is_correct,
                  objectiveId: delayedQuestion.learning_objective_id,
                  cardId: delayedQuestion.card_id,
                  questionId: delayedQuestion.question_id,
                })}
              >
                <span className="option-id">{option.option_id.toUpperCase()}</span>
                <span>{option.text_ru}</span>
              </button>
            ))}
          </div>
        </main>
      )}

      {state.screen === 'delayed_feedback' && state.delayedFeedback && delayedFeedbackQuestion && (
        <main className="screen">
          <p className="step">Отложенная проверка · результат</p>
          <h2 className={state.delayedFeedback.correct ? 'ok-text' : 'bad-text'}>
            {state.delayedFeedback.correct ? 'Верно' : 'Пока неверно'}
          </h2>
          <p>
            {state.delayedFeedback.correct
              ? 'Ответ верный. В этом прототипе тема получает статус «Уверенно».'
              : 'Тема добавлена в повторение. Отложенная проверка не заменяет разбор механизма.'}
          </p>
          <OptionResult question={delayedFeedbackQuestion} feedback={state.delayedFeedback} />
          <button className="primary" onClick={() => dispatch({ type: 'NEXT_DELAYED' })}>Дальше</button>
        </main>
      )}

      {state.screen === 'delayed_summary' && (
        <main className="screen">
          <h2>Итог отложенной проверки</h2>
          <p>
            Правильных ответов: <strong>{delayedCorrectCount}</strong> из <strong>{state.delayedOrder.length}</strong>.
            Это результат отложенных вопросов, а не процент готовности к экзамену.
          </p>
          {state.reviewQueue.length > 0 && (
            <button className="primary" onClick={() => dispatch({ type: 'START_REVIEW_QUEUE' })}>
              Повторить слабые темы ({state.reviewQueue.length})
            </button>
          )}
          <button className="secondary" onClick={() => dispatch({ type: 'GO_HOME' })}>К предмету</button>
          <button className="secondary" onClick={() => dispatch({ type: 'GO_LANDING' })}>На главную</button>
          <button className="secondary" onClick={reset}>Сбросить предмет</button>
        </main>
      )}

      {resumePromptOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setResumePromptOpen(false)}>
          <div
            className="modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="resume-title">Вернуться к обучению?</h2>
            <p>
              Предмет: «{subject.title}». У вас есть сохранённый прогресс
              {card ? `: карточка ${state.index + 1} из ${state.order.length} — «${card.title}»` : ''}.
              Продолжить с того же места или начать заново?
            </p>
            <div className="actions">
              <button
                className="primary"
                autoFocus
                onClick={() => {
                  setResumePromptOpen(false);
                  dispatch({ type: 'RESUME_STUDY' });
                }}
              >
                Продолжить с того же места
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setResumePromptOpen(false);
                  dispatch({ type: 'START' });
                }}
              >
                Начать заново
              </button>
              <button className="ghost" onClick={() => setResumePromptOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="attribution-slot">
        {activeAttribution && (
          <AttributionBlock attribution={activeAttribution.attribution} sourceRefs={activeAttribution.sourceRefs} />
        )}
      </div>

      <footer className="foot">
        {embeddedPreview
          ? 'Автономный прототип для редакторской проверки. Работает без сервера. Прогресс по каждому предмету сохраняется только до закрытия или обновления этой страницы.'
          : 'Прототип для редакторской проверки. Прогресс по каждому предмету хранится локально в браузере и может быть удалён при очистке данных сайта.'}
      </footer>
    </div>
  );
}
