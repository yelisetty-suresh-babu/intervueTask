// client/src/components/QuestionHistory.tsx
import { type FC } from "react";
import type { Question } from "../interface/types";
import LiveResults from "./LiveResult";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface QuestionHistoryProps {
  questions: Question[];
  setHistory: React.Dispatch<React.SetStateAction<boolean>>;
}

const QuestionHistory: FC<QuestionHistoryProps> = ({
  questions,
  setHistory,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto  rounded-lg  p-6 font-sora">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 gap-x-4 flex items-center justify-start pl-4">
        <Button type="default" onClick={() => setHistory(false)} size="small">
          <ArrowLeftOutlined />
        </Button>
        <div className="font-normal">
          View <b className="font-extrabold">Poll History</b>
        </div>
      </h2>

      {questions.length === 0 ? (
        <p className="text-gray-500 text-center">No previous questions yet.</p>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-scroll">
          {questions
            .slice()
            .reverse()
            .map((q) => (
              <div key={q.id} className="rounded-lg p-4">
                <LiveResults activeQuestion={q} isHistory={true} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default QuestionHistory;
