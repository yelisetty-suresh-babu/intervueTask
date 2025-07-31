// client/src/store/index.ts

import {
  configureStore,
  createSlice,
  type PayloadAction,
  type Middleware,
} from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import type {
  PollState,
  Question,
  PostQuestionPayload,
  SubmitAnswerPayload,
  UpdatePollResultsPayload,
  InitialQuestionsPayload,
  ServerActivateQuestionPayload,
  PostQuestionFailurePayload,
  ActivateQuestionFailurePayload,
} from "../interface/types";

// -------- SOCKET CONFIG --------------
// const socket: Socket = io("http://localhost:4000");
const socket: Socket = io("https://intervuetask-backend-wafy.onrender.com");

export const useSocket = () => {
  return socket;
};

// -------- INITIAL STATE --------------
const getOrCreateUser = (): { userId: string; userName: string | null } => {
  let userId = sessionStorage.getItem("polling_userId");
  const userName = sessionStorage.getItem("polling_userName");

  if (!userId) {
    userId = uuidv4();
    sessionStorage.setItem("polling_userId", userId);
  }

  return { userId, userName };
};

const { userId, userName } = getOrCreateUser();

const initialState: PollState = {
  questions: [],
  activeQuestionId: null,
  activeQuestionStartTime: null,
  activeQuestionDuration: null,
  isLoading: false,
  error: null,
  isPostingQuestion: false,
  userId,
  userName,
  isWaitingForNextQuestion: true,
};

// -------- REDUCER SLICE --------------
const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      // Avoid unnecessary updates (fixes infinite calls)
      if (state.userName === action.payload) return;
      state.userName = action.payload;
      sessionStorage.setItem("polling_userName", action.payload);
    },
    postQuestionStart: (state, action: PayloadAction<PostQuestionPayload>) => {
      state.isPostingQuestion = true;
      state.error = null;
      console.log(action);
    },
    postQuestionFailure: (state, action: PayloadAction<string>) => {
      state.isPostingQuestion = false;
      state.error = action.payload;
    },
    receiveNewQuestion: (state, action: PayloadAction<Question>) => {
      state.questions.push(action.payload);
      state.isWaitingForNextQuestion = false;
    },
    activateQuestion: (
      state,
      action: PayloadAction<ServerActivateQuestionPayload>
    ) => {
      state.activeQuestionId = action.payload.questionId;
      state.activeQuestionStartTime = action.payload.startTime;
      state.activeQuestionDuration = action.payload.durationMs;
      state.isPostingQuestion = false;
      state.isWaitingForNextQuestion = false;
    },
    activateQuestionFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    deactivateQuestion: (state) => {
      const wasActive = state.activeQuestionId !== null;
      state.activeQuestionId = null;
      state.activeQuestionStartTime = null;
      state.activeQuestionDuration = null;
      if (wasActive && state.questions.length > 0) {
        state.isWaitingForNextQuestion = true;
      }
    },
    clearWaitingState: (state) => {
      state.isWaitingForNextQuestion = false;
    },
    submitAnswerStart: (state, action: PayloadAction<SubmitAnswerPayload>) => {
      state.isLoading = true;
      console.log(action);
    },
    submitAnswerSuccess: (state) => {
      state.isLoading = false;
    },
    submitAnswerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updatePollResults: (
      state,
      action: PayloadAction<UpdatePollResultsPayload>
    ) => {
      const { questionId, updatedOptions } = action.payload;
      const questionIndex = state.questions.findIndex(
        (q) => q.id === questionId
      );
      if (questionIndex !== -1) {
        state.questions[questionIndex].options = updatedOptions;
      }
      state.isLoading = false;
    },
    setInitialQuestions: (
      state,
      action: PayloadAction<InitialQuestionsPayload>
    ) => {
      state.questions = action.payload.questions;
      state.activeQuestionId = action.payload.activeQuestionId;
      state.activeQuestionStartTime = action.payload.activeQuestionStartTime;
      state.activeQuestionDuration = action.payload.activeQuestionDurationMs;
      state.isWaitingForNextQuestion = true;
    },
  },
});

export const {
  setUserId,
  setUserName,
  postQuestionStart,
  postQuestionFailure,
  receiveNewQuestion,
  activateQuestion,
  activateQuestionFailure,
  deactivateQuestion,
  clearWaitingState,
  submitAnswerStart,
  submitAnswerSuccess,
  submitAnswerFailure,
  updatePollResults,
  setInitialQuestions,
} = pollSlice.actions;

// -------- MIDDLEWARE (socket emit) --------------
const socketMiddleware: Middleware<object, { poll: PollState }> =
  (storeAPI) =>
  (next) =>
  (action): unknown => {
    if (postQuestionStart.match(action)) {
      socket.emit(
        "postQuestion",
        action.payload as unknown as PostQuestionPayload
      );
    } else if (submitAnswerStart.match(action)) {
      const { questionId, selectedOptionText } =
        action.payload as unknown as SubmitAnswerPayload;
      const userId = storeAPI.getState().poll.userId;
      if (userId) {
        socket.emit("submitAnswer", { questionId, selectedOptionText, userId });
      } else {
        storeAPI.dispatch(submitAnswerFailure("User ID not available."));
      }
    } else if (deactivateQuestion.match(action)) {
      socket.emit("deactivateQuestion");
    }
    return next(action);
  };

// -------- STORE CONFIGURATION --------------
export const store = configureStore({
  reducer: {
    poll: pollSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

// -------- TYPE EXPORTS --------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// -------- SOCKET LISTENERS --------------
socket.on("newQuestion", (question: Question) => {
  store.dispatch(receiveNewQuestion(question));
});
socket.on("updatePollResults", (data: UpdatePollResultsPayload) => {
  store.dispatch(updatePollResults(data));
});
socket.on("activateQuestion", (data: ServerActivateQuestionPayload) => {
  store.dispatch(activateQuestion(data));
});
socket.on("activateQuestionFailure", (msg: ActivateQuestionFailurePayload) => {
  store.dispatch(activateQuestionFailure(msg));
});
socket.on("postQuestionFailure", (msg: PostQuestionFailurePayload) => {
  store.dispatch(postQuestionFailure(msg));
});
socket.on("deactivateQuestion", () => {
  store.dispatch(deactivateQuestion());
});
socket.on("initialQuestions", (data: InitialQuestionsPayload) => {
  store.dispatch(setInitialQuestions(data));
});

// -------- REGISTER USER ONCE --------------
const registerUser = () => {
  const currentState = store.getState().poll;
  const userNameToSend = currentState.userName || "Anonymous";
  console.log(
    `Registering user: ${currentState.userId} with name: ${userNameToSend}`
  );
  socket.emit("registerUser", {
    userId: currentState.userId,
    userName: userNameToSend,
  });
};

let hasRegistered = false;
store.subscribe(() => {
  const currentState = store.getState().poll;
  if (!hasRegistered && currentState.userName) {
    registerUser();
    hasRegistered = true;
  }
});

// Initial registration call if userName was already in sessionStorage
if (userName) {
  registerUser();
  hasRegistered = true;
}

// Get initial questions
socket.emit("getInitialQuestions");
