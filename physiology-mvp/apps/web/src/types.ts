export interface Attribution {
  source_title: string;
  editor: string | null;
  publisher: string;
  year: number;
  source_url: string;
  chapter_url: string;
  locator: string;
  copyright_notice: string;
  license: string;
  license_url: string;
  required_notice: string;
  changes_ru: string;
  no_endorsement_ru: string;
}

export interface SourceRef {
  source_id: string;
  url: string;
  title?: string;
  locator?: string;
}

export interface Card {
  card_id: string;
  topic_id: string;
  learning_objective_id: string;
  title: string;
  body_ru: string;
  key_chain_ru: string[];
  source_refs: SourceRef[];
  source_locator: string;
  asset_refs: string[];
  license: string;
  adaptation_type: string;
  change_note_ru: string;
  review_status: string;
  reviewer: string | null;
  version: number;
  attribution: Attribution;
}

export interface Option {
  option_id: string;
  text_ru: string;
  is_correct: boolean;
  explanation_ru: string;
  hint_ru: string | null;
}

export interface Question {
  question_id: string;
  learning_objective_id: string;
  card_id: string;
  prompt_ru: string;
  options: Option[];
  correct_option_id: string;
  explanation_correct_ru: string;
  difficulty: string;
  assessment_role: string;
  misconception_tags: string[];
  source_id: string;
  source_refs: SourceRef[];
  license: string;
  adaptation_type: string;
  review_status: string;
  reviewer: string | null;
  version: number;
  attribution: Attribution;
}

export type Screen =
  | 'landing'
  | 'home'
  | 'theory'
  | 'question'
  | 'feedback'
  | 'review'
  | 'summary'
  | 'delayed_question'
  | 'delayed_feedback'
  | 'delayed_summary';
export type Mastery = 'new' | 'needs_review' | 'developing' | 'confident';

export interface Feedback {
  questionId: string;
  optionId: string;
  correct: boolean;
  reveal: boolean;
  objectiveId: string;
  cardId: string;
}

/** Progress for one subject, without the catalog of other saved subjects. */
export interface StudyProgress {
  screen: Screen;
  baseOrder: string[];
  order: string[];
  index: number;
  selectedOptionId: string | null;
  attempts: Record<string, number>;
  feedback: Feedback | null;
  reviewQueue: string[];
  xp: number;
  mastery: Record<string, Mastery>;
  started: boolean;
  learningCompletedAt: number | null;
  delayedOrder: string[];
  delayedIndex: number;
  delayedResults: Record<string, boolean>;
  delayedFeedback: Feedback | null;
  resumeScreen: Screen | null;
}

export interface SessionState extends StudyProgress {
  subjectId: string;
  /** Inactive subjects. The active subject is stored at the top level. */
  saved: Record<string, StudyProgress>;
}
