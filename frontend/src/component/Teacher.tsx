import { type FC, useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  postQuestionStart,
  deactivateQuestion,
  setUserName,
  type RootState,
  useSocket,
} from "../store";
import type { Question, PostQuestionPayload } from "../interface/types";
import CreatePoll from "./CreatePoll";
import LiveResults from "./LiveResult";
import QuestionHistory from "./QuestionHistory";
import { message } from "antd";
import Loading from "./Loading";

const TeacherApp: FC = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [messageApi, contextHolder] = message.useMessage();

  const questions = useSelector((state: RootState) => state.poll.questions);
  const activeQuestionId = useSelector(
    (state: RootState) => state.poll.activeQuestionId
  );
  const isPostingQuestion = useSelector(
    (state: RootState) => state.poll.isPostingQuestion
  );
  const error = useSelector((state: RootState) => state.poll.error);
  if (error) throw new Error(error ?? "Error");

  const userName = useSelector((state: RootState) => state.poll.userName);

  const isQuestionActive = activeQuestionId !== null;
  const [questionTimeLimit, setQuestionTimeLimit] = useState<number>(60);
  const [history, setHistory] = useState<boolean>(false);
  const [showCreatePoll, setShowCreatePoll] = useState<boolean>(false);

  const activeQuestion: Question | undefined = useMemo(() => {
    return questions.find((q) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  // Get the most recent completed question for live results
  const lastCompletedQuestion: Question | undefined = useMemo(() => {
    if (questions.length === 0) return undefined;
    // Return the most recent question (last in the array)
    return questions[questions.length - 1];
  }, [questions]);

  // Set teacher username once
  useEffect(() => {
    if (userName !== "Teacher") {
      dispatch(setUserName("Teacher"));
    }
  }, [dispatch, userName]);

  useEffect(() => {
    if (!socket) return;

    const handleQuestionComplete = () => {
      dispatch(deactivateQuestion());
      setShowCreatePoll(false); // Reset to show live results when question completes
    };

    socket.on("deactivateQuestion", handleQuestionComplete);

    return () => {
      socket.off("deactivateQuestion", handleQuestionComplete);
    };
  }, [socket, dispatch]);

  const handlePostQuestion = (questionText: string, options: string[]) => {
    if (questionText && options.length > 0 && questionTimeLimit > 0) {
      const questionData: PostQuestionPayload = {
        questionText,
        options,
        durationSeconds: questionTimeLimit,
      };
      dispatch(postQuestionStart(questionData));
      setShowCreatePoll(false); // Hide create poll after posting
    } else {
      messageApi.open({
        type: "error",
        content: "Please enter a question, options, and a valid time limit.",
      });
    }
  };

  const handleAddNewQuestion = () => {
    setShowCreatePoll(true);
  };

  // Render the appropriate content based on current state
  const renderContent = () => {
    // Show question history
    if (history) {
      return <QuestionHistory questions={questions} setHistory={setHistory} />;
    }

    // Show active question results
    if (activeQuestion) {
      return (
        <div className="w-full max-w-xl mx-auto flex flex-col bg-white rounded-lg p-4">
          <LiveResults activeQuestion={activeQuestion} isHistory={true} />
        </div>
      );
    }

    // Show create poll form
    if (showCreatePoll) {
      return (
        <CreatePoll
          setQuestionTimeLimit={setQuestionTimeLimit}
          isPostingQuestion={isPostingQuestion}
          isQuestionActive={isQuestionActive}
          handlePostQuestion={handlePostQuestion}
          questionTimeLimit={questionTimeLimit}
          setHistory={setHistory}
        />
      );
    }

    // Show last completed question results
    if (lastCompletedQuestion) {
      return (
        <div className="w-full max-w-xl mx-auto flex flex-col bg-white rounded-lg p-4">
          <LiveResults
            activeQuestion={lastCompletedQuestion}
            isHistory={true}
            onAddNewQuestion={handleAddNewQuestion}
          />
        </div>
      );
    }
    if (isPostingQuestion)
      return (
        // <div className="flex items-center justify-center w-screen h-screen">
        //   <Spin />
        // </div>
        <Loading message="Please wait, posting your question..." />
      );

    return (
      <CreatePoll
        setQuestionTimeLimit={setQuestionTimeLimit}
        isPostingQuestion={isPostingQuestion}
        isQuestionActive={isQuestionActive}
        handlePostQuestion={handlePostQuestion}
        questionTimeLimit={questionTimeLimit}
        setHistory={setHistory}
      />
    );
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {contextHolder}
      <div className="w-full">{renderContent()}</div>
    </div>
  );
};

export default TeacherApp;
