// client/src/store/index.ts
import {
  configureStore,
  createSlice,
  type PayloadAction,
  type Middleware,
} from "@reduxjs/toolkit";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import type {
  PollState,
  Question,
  PostQuestionPayload,
  SubmitAnswerPayload,
  UpdatePollResultsPayload,
  InitialQuestionsPayload,
  ActivateQuestionPayload,
  ServerActivateQuestionPayload,
  RegisterUserPayload,
  PostQuestionFailurePayload,
  ActivateQuestionFailurePayload,
} from "../interface/types";

interface ClientToServerEvents {
  postQuestion: (data: PostQuestionPayload) => void;
  submitAnswer: (data: SubmitAnswerPayload) => void;
  activateQuestion: (data: ActivateQuestionPayload) => void;
  deactivateQuestion: () => void;
  getInitialQuestions: () => void;
  registerUser: (userId: RegisterUserPayload) => void;
}

interface ServerToClientEvents {
  newQuestion: (question: Question) => void;
  updatePollResults: (data: UpdatePollResultsPayload) => void;
  activateQuestion: (data: ServerActivateQuestionPayload) => void;
  deactivateQuestion: () => void;
  initialQuestions: (data: InitialQuestionsPayload) => void;
  postQuestionFailure: (message: PostQuestionFailurePayload) => void;
  activateQuestionFailure: (message: ActivateQuestionFailurePayload) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:4000"
);

const getOrCreateUser = (): { userId: string; userName: string | null } => {
  let userId = sessionStorage.getItem("polling_userId"); // Back to sessionStorage for new tab = new user
  let userName = sessionStorage.getItem("polling_userName"); // Back to sessionStorage

  if (!userId) {
    userId = uuidv4();
    sessionStorage.setItem("polling_userId", userId); // Fixed: use sessionStorage consistently
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
  userId: userId,
  userName: userName,
};

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
      sessionStorage.setItem("polling_userName", action.payload); // Back to sessionStorage
    },
    postQuestionStart: (state) => {
      state.isPostingQuestion = true;
      state.error = null;
    },
    postQuestionFailure: (state, action: PayloadAction<string>) => {
      state.isPostingQuestion = false;
      state.error = action.payload;
    },
    receiveNewQuestion: (state, action: PayloadAction<Question>) => {
      state.questions.push(action.payload);
    },
    teacherActivateQuestion: (
      state,
      action: PayloadAction<ActivateQuestionPayload>
    ) => {
      // This is a no-op reducer, its purpose is to be caught by the middleware.
    },
    activateQuestion: (
      state,
      action: PayloadAction<ServerActivateQuestionPayload>
    ) => {
      state.activeQuestionId = action.payload.questionId;
      state.activeQuestionStartTime = action.payload.startTime;
      state.activeQuestionDuration = action.payload.durationMs;
      state.isPostingQuestion = false; // Turn off posting loading if this was the result of a post
    },
    activateQuestionFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    deactivateQuestion: (state) => {
      console.log("Deactivating question in Redux store.");
      state.activeQuestionId = null;
      state.activeQuestionStartTime = null;
      state.activeQuestionDuration = null;
    },
    submitAnswerStart: (state) => {
      state.isLoading = true;
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
      state.isLoading = false; // Ensure loading is off after receiving update
    },
    setInitialQuestions: (
      state,
      action: PayloadAction<InitialQuestionsPayload>
    ) => {
      state.questions = action.payload.questions;
      state.activeQuestionId = action.payload.activeQuestionId;
      state.activeQuestionStartTime = action.payload.activeQuestionStartTime;
      state.activeQuestionDuration = action.payload.activeQuestionDurationMs;
    },
  },
});

export const {
  setUserId,
  setUserName,
  postQuestionStart,
  postQuestionFailure,
  receiveNewQuestion,
  teacherActivateQuestion,
  activateQuestion,
  activateQuestionFailure,
  deactivateQuestion,
  submitAnswerStart,
  submitAnswerSuccess,
  submitAnswerFailure,
  updatePollResults,
  setInitialQuestions,
} = pollSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useSocket = () => {
  console.log("useSocket called, returning socket instance:", socket);
  return socket;
};

const socketMiddleware: Middleware<{}, RootState> =
  (storeAPI) => (next) => (action) => {
    if (postQuestionStart.match(action)) {
      socket.emit("postQuestion", action.payload as PostQuestionPayload);
    } else if (submitAnswerStart.match(action)) {
      const { questionId, selectedOptionText } =
        action.payload as SubmitAnswerPayload;
      const userId = storeAPI.getState().poll.userId;
      if (userId) {
        socket.emit("submitAnswer", { questionId, selectedOptionText, userId });
      } else {
        console.error("User ID not available for submitting answer.");
        storeAPI.dispatch(submitAnswerFailure("User ID not available."));
      }
    } else if (teacherActivateQuestion.match(action)) {
      socket.emit("activateQuestion", action.payload);
    } else if (deactivateQuestion.match(action)) {
      socket.emit("deactivateQuestion");
    }
    return next(action);
  };

export const store = configureStore({
  reducer: {
    poll: pollSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

// Socket.IO Listeners
socket.on("newQuestion", (question: Question) => {
  store.dispatch(receiveNewQuestion(question));
});

socket.on("updatePollResults", (data: UpdatePollResultsPayload) => {
  store.dispatch(updatePollResults(data));
});

socket.on("activateQuestion", (data: ServerActivateQuestionPayload) => {
  // Listen for server's activation
  store.dispatch(activateQuestion(data));
});

socket.on(
  "activateQuestionFailure",
  (message: ActivateQuestionFailurePayload) => {
    store.dispatch(activateQuestionFailure(message));
  }
);

socket.on("postQuestionFailure", (message: PostQuestionFailurePayload) => {
  store.dispatch(postQuestionFailure(message));
});

socket.on("deactivateQuestion", () => {
  console.log("Received 'deactivateQuestion' event from server.");
  store.dispatch(deactivateQuestion());
});
console.log("Registered 'deactivateQuestion' listener.");

socket.on("initialQuestions", (data: InitialQuestionsPayload) => {
  store.dispatch(setInitialQuestions(data));
});

// Register user on connection - but wait for userName to be set if it's null
const { userId: initialUserId, userName: initialUserName } = getOrCreateUser();

// Function to register user with server
const registerUser = () => {
  const currentState = store.getState().poll;
  const userNameToSend = currentState.userName || "Anonymous"; // Fallback to "Anonymous"
  console.log(
    `Registering user: ${currentState.userId} with name: ${userNameToSend}`
  );
  socket.emit("registerUser", {
    userId: currentState.userId,
    userName: userNameToSend,
  });
};

// Listen for userName changes and re-register if needed
let hasRegistered = false;
store.subscribe(() => {
  const currentState = store.getState().poll;
  if (
    !hasRegistered ||
    (currentState.userName && currentState.userName !== initialUserName)
  ) {
    registerUser();
    hasRegistered = true;
  }
});

// Initial registration
registerUser();

socket.emit("getInitialQuestions");
