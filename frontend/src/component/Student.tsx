import { type FC, useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { submitAnswerStart, type RootState, setUserName } from "../store";
import type { Question, SubmitAnswerPayload } from "../interface/types";
import Loading from "./Loading";
import StudentWelcome from "./StudentWelcome";
import QuizQuestion from "./QuestionDisplay";
import LiveResults from "./LiveResult";

const StudentApp: FC = () => {
  const dispatch = useDispatch();
  const {
    questions,
    activeQuestionId,
    activeQuestionStartTime,
    activeQuestionDuration,
    error,
    userId,
    userName,
    isWaitingForNextQuestion,
  } = useSelector((state: RootState) => state.poll);

  const [name, setName] = useState("");
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [promptShown, setPromptShown] = useState(false);

  const activeQuestion: Question | undefined = useMemo(() => {
    return questions.find((q: Question) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  const hasUserVoted = useMemo(() => {
    if (!activeQuestion || !userId) return false;
    return activeQuestion.options.some((option) =>
      option.voterIds.includes(userId)
    );
  }, [activeQuestion, userId]);

  const hasTimeExpired = useMemo(() => {
    return remainingTime !== null && remainingTime <= 0;
  }, [remainingTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeQuestionId && activeQuestionStartTime && activeQuestionDuration) {
      const endTime = activeQuestionStartTime + activeQuestionDuration;
      const updateTimer = () => {
        setRemainingTime(Math.max(0, endTime - Date.now()));
      };
      timer = setInterval(updateTimer, 1000);
      updateTimer();
    } else {
      setRemainingTime(null);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeQuestionId, activeQuestionStartTime, activeQuestionDuration]);

  const handleSubmitAnswer = (optionText: string) => {
    if (!userId || !activeQuestion) return;
    const payload: SubmitAnswerPayload = {
      questionId: activeQuestion.id,
      selectedOptionText: optionText,
      userId,
    };
    dispatch(submitAnswerStart(payload));
  };

  const handleNameSubmit = (name: string) => {
    dispatch(setUserName(name.trim()));
    setPromptShown(true);
  };

  return (
    <div className="w-full">
      {!userName && !promptShown && (
        <StudentWelcome
          name={name}
          setName={setName}
          handleNameSubmit={handleNameSubmit}
        />
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {activeQuestion ? (
        <div className="w-full">
          {/* Show Question if user hasn't answered */}
          {!hasUserVoted && !hasTimeExpired ? (
            <QuizQuestion
              activeQuestion={activeQuestion}
              remainingTime={remainingTime}
              hasUserVoted={hasUserVoted}
              hasTimeExpired={hasTimeExpired}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ) : (
            // Show results if user already answered or time expired
            <div className="max-w-xl mx-auto">
              <LiveResults activeQuestion={activeQuestion} />
            </div>
          )}
        </div>
      ) : isWaitingForNextQuestion ? (
        <Loading />
      ) : (
        <p className="text-center mt-10 text-lg text-gray-700">
          No question is currently active. Please wait for the teacher.
        </p>
      )}
    </div>
  );
};

export default StudentApp;
