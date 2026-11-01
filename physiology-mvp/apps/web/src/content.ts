import muscleCards from '@content/pilot/muscle/cards.json';
import muscleQuestions from '@content/pilot/muscle/questions.json';
import muscleDelayed from '@content/pilot/muscle/delayed_checks.json';
import tourismCards from '@content/pilot/tourism/cards.json';
import tourismQuestions from '@content/pilot/tourism/questions.json';
import tourismDelayed from '@content/pilot/tourism/delayed_checks.json';
import topoCards from '@content/pilot/topography/cards.json';
import topoQuestions from '@content/pilot/topography/questions.json';
import topoDelayed from '@content/pilot/topography/delayed_checks.json';
import type { Card, Question } from './types';

export interface Subject {
  id: string;
  title: string;
  moduleTitle: string;
  description: string;
  cards: Card[];
  questions: Question[];
  delayedQuestions: Question[];
  baseOrder: string[];
  status: 'mixed' | 'draft';
  statusNote: string;
}

function makeSubject(
  id: string,
  title: string,
  moduleTitle: string,
  description: string,
  cards: Card[],
  questions: Question[],
  delayedQuestions: Question[],
  status: Subject['status'],
  statusNote: string,
): Subject {
  return {
    id,
    title,
    moduleTitle,
    description,
    cards,
    questions,
    delayedQuestions,
    baseOrder: cards.map((c) => c.card_id),
    status,
    statusNote,
  };
}

export const subjects: Subject[] = [
  makeSubject(
    'physiology',
    'Физиология человека',
    'Физиология мышечной деятельности',
    'Как работает мышца: свойства мышечной ткани, скольжение нитей, нервный сигнал, утомление и адаптация к нагрузке.',
    muscleCards as Card[],
    muscleQuestions as Question[],
    muscleDelayed as Question[],
    'mixed',
    'Эталонные карточки отмечены как утверждённые со слов организатора; остальные материалы — черновик.',
  ),
  makeSubject(
    'tourism',
    'Основы спортивно-оздоровительного туризма',
    'Безопасный учебный поход',
    'Стартовый модуль о цели похода, планировании, уведомлении МЧС, снаряжении и решениях группы на маршруте.',
    tourismCards as Card[],
    tourismQuestions as Question[],
    tourismDelayed as Question[],
    'draft',
    'Новый предмет: все карточки и вопросы — редакторский черновик до проверки преподавателем туризма.',
  ),
  makeSubject(
    'topography',
    'Топография и ориентирование на местности',
    'Карта, рельеф, компас',
    'Стартовый модуль о масштабе и легенде, горизонталях, азимуте и контроле пути по карте и ориентирам.',
    topoCards as Card[],
    topoQuestions as Question[],
    topoDelayed as Question[],
    'draft',
    'Новый предмет: все карточки и вопросы — редакторский черновик до проверки преподавателем топографии.',
  ),
];

export const subjectById = new Map(subjects.map((s) => [s.id, s]));

export function getSubject(id: string): Subject {
  return subjectById.get(id) ?? subjects[0];
}

export function questionsForObjective(subject: Subject, objectiveId: string): Question[] {
  return subject.questions
    .filter((q) => q.learning_objective_id === objectiveId && q.assessment_role === 'practice')
    .sort((a, b) => a.question_id.localeCompare(b.question_id));
}

export function questionForAttempt(subject: Subject, objectiveId: string, attemptIndex: number): Question {
  const variants = questionsForObjective(subject, objectiveId);
  if (variants.length === 0) throw new Error(`No practice questions for ${objectiveId}`);
  return variants[Math.min(Math.max(attemptIndex, 0), variants.length - 1)];
}

export function subjectItemCount(subject: Subject): number {
  return subject.cards.length + subject.questions.length + subject.delayedQuestions.length;
}

export function approvedCardCount(subject: Subject): number {
  return subject.cards.filter((c) => c.review_status === 'approved').length;
}

export function draftItemCount(subject: Subject): number {
  return [...subject.cards, ...subject.questions, ...subject.delayedQuestions].filter((item) => item.review_status !== 'approved').length;
}
