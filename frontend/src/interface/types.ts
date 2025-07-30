export interface Option {
  text: string;
  votes: number;
  voterIds: string[];
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  creatorId: string;
  timestamp: string;
}

// client/src/interface/types.ts - Add the new field to PollState
export interface PollState {
  questions: Question[];
  activeQuestionId: string | null;
  activeQuestionStartTime: number | null;
  activeQuestionDuration: number | null;
  isLoading: boolean;
  error: string | null;
  isPostingQuestion: boolean;
  userId: string;
  userName: string | null;
  isWaitingForNextQuestion: boolean; // Add this new field
}

// For Socket.IO event payloads
export interface PostQuestionPayload {
  questionText: string;
  options: string[];
  durationSeconds: number; // New: Duration for the question
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedOptionText: string;
  userId: string;
}

export interface UpdatePollResultsPayload {
  questionId: string;
  updatedOptions: Option[];
}

export interface InitialQuestionsPayload {
  questions: Question[];
  activeQuestionId: string | null;
  activeQuestionStartTime: number | null;
  activeQuestionDurationMs: number | null;
}

// New payload for activateQuestion (teacher to activate an old question)
export interface ActivateQuestionPayload {
  questionId: string;
  durationSeconds: number; // Duration when activating an existing question
}

// New payload for activateQuestion event from server
export interface ServerActivateQuestionPayload {
  questionId: string;
  startTime: number;
  durationMs: number;
}

export type RegisterUserPayload = string;
export type PostQuestionFailurePayload = string;
export type ActivateQuestionFailurePayload = string;
