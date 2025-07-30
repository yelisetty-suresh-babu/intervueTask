// client/src/components/StudentApp.tsx
import { type FC, useMemo, useState, useEffect } from "react"; // Import useState, useEffect
import { useSelector, useDispatch } from "react-redux";
import { submitAnswerStart, type RootState, setUserName } from "../store";
import type { Question, SubmitAnswerPayload } from "../interface/types";

const StudentApp: FC = () => {
  const dispatch = useDispatch();
  const {
    questions,
    activeQuestionId,
    activeQuestionStartTime,
    activeQuestionDuration,
    isLoading,
    error,
    userId,
    userName,
    isWaitingForNextQuestion, // Add this to your Redux state
  } = useSelector((state: RootState) => state.poll);

  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [promptShown, setPromptShown] = useState(false); // New state to track if prompt has been shown

  const activeQuestion: Question | undefined = useMemo(() => {
    return questions.find((q: Question) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  // Check if the current user has already voted for the active question
  const hasUserVoted = useMemo(() => {
    if (!activeQuestion || !userId) return false;
    return activeQuestion.options.some((option) =>
      option.voterIds.includes(userId)
    );
  }, [activeQuestion, userId]);

  // Calculate if the time has expired
  const hasTimeExpired = useMemo(() => {
    // If there's no active question, and remainingTime was already 0 or less, it means time expired.
    if (
      activeQuestionId === null &&
      (remainingTime === 0 || remainingTime === null)
    ) {
      return true;
    }
    // Otherwise, check if remainingTime is 0 or less for an an active question.
    return remainingTime !== null && remainingTime <= 0;
  }, [remainingTime, activeQuestionId]);

  // Effect for countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      activeQuestionId &&
      activeQuestionStartTime !== null &&
      activeQuestionDuration !== null
    ) {
      const endTime = activeQuestionStartTime + activeQuestionDuration;

      const updateTimer = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTime - now);
        setRemainingTime(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
        }
      };

      timer = setInterval(updateTimer, 1000); // Update every second
      updateTimer(); // Initial call to set time immediately
    } else {
      setRemainingTime(null); // No active question, no timer
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeQuestionId, activeQuestionStartTime, activeQuestionDuration]);

  // Prompt for user name if not already set
  useEffect(() => {
    if (!userName && !promptShown) {
      let name = prompt("Please enter your name:");
      while (!name || name.trim() === "") {
        name = prompt("Name cannot be empty. Please enter your name:");
      }
      dispatch(setUserName(name.trim()));
      setPromptShown(true); // Set flag to true after showing prompt
    }
  }, [userName, dispatch, promptShown]);

  // Format remaining time for display
  const formatTime = (ms: number | null): string => {
    if (ms === null) return "00:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmitAnswer = (
    questionId: string,
    selectedOptionText: string
  ) => {
    if (!userId) {
      console.error("User ID not available. Cannot submit vote.");
      return;
    }
    const payload: SubmitAnswerPayload = {
      questionId,
      selectedOptionText,
      userId,
    };
    dispatch(submitAnswerStart(payload));
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      />
      <p
        style={{
          fontSize: "1.2em",
          color: "#666",
          margin: "0",
        }}
      >
        Waiting for the next question...
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  return (
    <div>
      <h1>Student View: Answer Current Question</h1>
      {userName && <p>Welcome, {userName}!</p>}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {activeQuestion ? (
        <div>
          <h2>Question: {activeQuestion.text}</h2>
          {!hasUserVoted && (
            <p style={{ fontSize: "1.2em", fontWeight: "bold" }}>
              Time left: {formatTime(remainingTime)}
            </p>
          )}

          <h3>Choose your Answer:</h3>
          {hasUserVoted ? (
            <p style={{ color: "blue", fontWeight: "bold" }}>
              You have already voted for this question!
            </p>
          ) : hasTimeExpired ? (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Time has expired for this question!
            </p>
          ) : (
            <ul>
              {activeQuestion.options.map((option, index) => (
                <li key={index}>
                  {option.text}
                  <button
                    onClick={() =>
                      handleSubmitAnswer(activeQuestion.id, option.text)
                    }
                    disabled={isLoading || hasUserVoted || hasTimeExpired} // Disable logic
                  >
                    {isLoading ? "Submitting..." : "Vote"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {isLoading && <p>Submitting your vote...</p>}

          {(hasUserVoted || hasTimeExpired) && (
            <>
              <h3>Current Results:</h3>
              {activeQuestion.options.map((option, index) => (
                <p key={index}>
                  {option.text}: **{option.votes}** votes
                </p>
              ))}
            </>
          )}
        </div>
      ) : isWaitingForNextQuestion ? (
        // Show loading spinner when waiting for next question
        <LoadingSpinner />
      ) : (
        <p>
          No question is currently active. Please wait for the teacher to post
          or activate a question.
        </p>
      )}
    </div>
  );
};

export default StudentApp;
