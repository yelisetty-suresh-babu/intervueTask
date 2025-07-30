import { type FC, useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { submitAnswerStart, type RootState, setUserName } from "../store";
import type { Question, SubmitAnswerPayload } from "../interface/types";
import Loading from "./Loading";
import StudentWelcome from "./StudentWelcome";
import QuizQuestion from "./QuestionDisplay";
import LiveResults from "./LiveResult";
import StudentChat from "./StudentChat";
import { Modal } from "antd";

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
  const [openModal, setOpenModal] = useState<boolean>(false);

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

      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full 
                 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] 
                 shadow-lg flex items-center justify-center 
                 text-white hover:scale-110 transition-transform duration-200"
      >
        {/* <WechatWorkOutlined className="text-xl" /> */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 39 39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30.625 0H7.875C6.58207 0 5.34209 0.513615 4.42785 1.42785C3.51361 2.34209 3 3.58207 3 4.875V21.125C3 22.4179 3.51361 23.6579 4.42785 24.5721C5.34209 25.4864 6.58207 26 7.875 26H26.7087L32.7213 32.0288C32.8731 32.1794 33.0532 32.2985 33.2512 32.3794C33.4491 32.4603 33.6611 32.5012 33.875 32.5C34.0882 32.5055 34.2996 32.461 34.4925 32.37C34.7893 32.2481 35.0433 32.0411 35.2226 31.775C35.4019 31.509 35.4984 31.1958 35.5 30.875V4.875C35.5 3.58207 34.9864 2.34209 34.0721 1.42785C33.1579 0.513615 31.9179 0 30.625 0ZM32.25 26.9588L28.5287 23.2213C28.3769 23.0706 28.1968 22.9515 27.9988 22.8706C27.8009 22.7898 27.5889 22.7488 27.375 22.75H7.875C7.44402 22.75 7.0307 22.5788 6.72595 22.274C6.42121 21.9693 6.25 21.556 6.25 21.125V4.875C6.25 4.44402 6.42121 4.0307 6.72595 3.72595C7.0307 3.42121 7.44402 3.25 7.875 3.25H30.625C31.056 3.25 31.4693 3.42121 31.774 3.72595C32.0788 4.0307 32.25 4.44402 32.25 4.875V26.9588Z"
            fill="white"
          />
        </svg>
      </button>
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

      <Modal
        title="Chat"
        closable={{ "aria-label": "Custom Close Button" }}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        closeIcon={null}
        width={500}
        bodyStyle={{ height: 400 }}
      >
        <StudentChat />
      </Modal>
    </div>
  );
};

export default StudentApp;
