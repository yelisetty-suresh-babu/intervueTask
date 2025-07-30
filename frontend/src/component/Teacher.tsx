// client/src/components/TeacherApp.tsx
import React, { FC, useMemo, useState, useEffect } from "react"; // Import useState and useEffect
import { useSelector, useDispatch } from "react-redux";
import {
  postQuestionStart,
  teacherActivateQuestion,
  deactivateQuestion,
  setUserName, // Import setUserName
  type RootState,
  useSocket,
} from "../store";
import type {
  Question,
  PostQuestionPayload,
  ActivateQuestionPayload,
} from "../interface/types";

const TeacherApp: FC = () => {
  const dispatch = useDispatch();
  const socket = useSocket(); // Get the socket instance
  const questions = useSelector((state: RootState) => state.poll.questions);
  const activeQuestionId = useSelector(
    (state: RootState) => state.poll.activeQuestionId
  );
  const isPostingQuestion = useSelector(
    (state: RootState) => state.poll.isPostingQuestion
  );
  const error = useSelector((state: RootState) => state.poll.error);

  const isQuestionActive = activeQuestionId !== null;

  // State for the time limit input
  const [questionTimeLimit, setQuestionTimeLimit] = useState<number>(20); // Default 20 seconds

  const activeQuestion: Question | undefined = useMemo(() => {
    return questions.find((q) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  // Set teacher username IMMEDIATELY when component mounts (before useEffect)
  React.useLayoutEffect(() => {
    dispatch(setUserName("Teacher"));
  }, [dispatch]);

  // Listen for question completion from the server
  useEffect(() => {
    if (!socket) return;

    console.log("Setting up deactivateQuestion listener.");

    const handleQuestionComplete = () => {
      console.log(
        "Question completed by server timer. Dispatching deactivateQuestion."
      );
      dispatch(deactivateQuestion());
    };

    socket.on("deactivateQuestion", handleQuestionComplete);

    return () => {
      console.log("Tearing down deactivateQuestion listener.");
      socket.off("deactivateQuestion", handleQuestionComplete);
    };
  }, [socket, dispatch]);

  console.log("TeacherApp render - activeQuestionId:", activeQuestionId);
  console.log("TeacherApp render - isQuestionActive:", isQuestionActive);

  const handlePostQuestion = () => {
    const questionText = prompt("Enter your question:");
    if (!questionText) return;
    const optionsString = prompt(
      "Enter options separated by comma (e.g., Option A, Option B):"
    );
    if (!optionsString) return;
    const options = optionsString.split(",").map((opt) => opt.trim());

    if (questionText && options.length > 0 && questionTimeLimit > 0) {
      const questionData: PostQuestionPayload = {
        questionText,
        options,
        durationSeconds: questionTimeLimit,
      };
      dispatch(postQuestionStart(questionData));
    } else {
      alert("Please enter a question, options, and a valid time limit.");
    }
  };

  const handleActivateQuestion = (questionId: string) => {
    if (questionTimeLimit > 0) {
      const payload: ActivateQuestionPayload = {
        questionId,
        durationSeconds: questionTimeLimit,
      };
      dispatch(teacherActivateQuestion(payload));
    } else {
      alert("Please set a valid time limit before activating.");
    }
  };

  return (
    <div>
      <h1>Teacher Dashboard: Post & Manage Questions</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h2>1. Post a New Question</h2>
      <div>
        <label htmlFor="timeLimit">Time Limit (seconds): </label>
        <input
          id="timeLimit"
          type="number"
          value={questionTimeLimit}
          onChange={(e) =>
            setQuestionTimeLimit(Math.max(1, parseInt(e.target.value) || 20))
          }
          min="1"
          disabled={isPostingQuestion || isQuestionActive}
          style={{ width: "80px", marginRight: "10px" }}
        />
        <button
          onClick={handlePostQuestion}
          disabled={isPostingQuestion || isQuestionActive}
        >
          {isPostingQuestion ? "Posting Question..." : "Post New Question"}
        </button>
      </div>
      {isPostingQuestion && <p>Please wait, posting your question...</p>}

      <hr />

      <h2>2. Current Active Question for Students</h2>
      {activeQuestion ? (
        <div>
          <p>
            Students are currently seeing:{" "}
            <strong>"{activeQuestion.text}"</strong>
          </p>

          <h3>Live Results for Active Question:</h3>
          <ul>
            {activeQuestion.options.map((option, index) => (
              <li key={index}>
                {option.text}: **{option.votes}** votes
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>
          No question is currently active for students. Post a new one or
          activate from the list below.
        </p>
      )}

      <hr />

      <h2>3. All Questions (Click to Activate)</h2>
      {questions.length === 0 ? (
        <p>No questions posted yet.</p>
      ) : (
        <ul>
          {[...questions].reverse().map((q: Question) => (
            <li key={q.id} style={{ marginBottom: "10px" }}>
              **{q.text}**{" "}
              {q.id === activeQuestionId ? (
                <span style={{ color: "green", fontWeight: "bold" }}>
                  {" "}
                  (Currently Active)
                </span>
              ) : (
                <button
                  onClick={() => handleActivateQuestion(q.id)}
                  disabled={isQuestionActive}
                >
                  Activate this Question
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherApp;
