import React from "react";
import type { Question } from "../interface/types";

interface LiveResultsProps {
  activeQuestion: Question;
  isHistory?: boolean;
  onAddNewQuestion?: () => void;
  index?: number;
}

const LiveResults: React.FC<LiveResultsProps> = ({
  activeQuestion,
  isHistory,
  onAddNewQuestion,
  index,
}) => {
  // Total votes for percentage calculation
  const totalVotes = activeQuestion.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  return (
    <div
      className={`flex justify-center items-center  ${
        isHistory ? "" : "min-h-screen"
      } `}
    >
      <div className="w-full">
        {/* Question Header */}
        <div className="flex justify-between items-center mb-3 px-2">
          <h2 className="text-lg font-semibold text-black">
            Question {index !== undefined ? index : "Result"}
          </h2>
        </div>

        {/* Question Box */}
        <div className="rounded-md overflow-hidden border border-gray-300">
          <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-4 py-2 text-sm font-semibold">
            {activeQuestion.text}
          </div>

          <div className="p-4 space-y-3">
            {activeQuestion.options.map((option, index) => {
              const percentage =
                totalVotes > 0
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0;

              return (
                <div
                  key={index}
                  className="w-full flex items-center px-2 py-2 bg-gray-100 rounded-md relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-[#6766D5] rounded-md transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="flex items-center relative z-10 w-full justify-between px-2">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center border border-[#6766D5] w-6 h-6 text-xs font-bold rounded-full mr-3 bg-purple-100 text-[#6766D5]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-black">
                        {option.text}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-black">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {!isHistory && (
          <div className="flex justify-center mt-6">
            <p className="text-lg font-semibold text-black">
              Wait for the teacher to ask a new question..
            </p>
          </div>
        )}

        {/* Add New Question Button for Teacher */}
        {isHistory && onAddNewQuestion && (
          <div className="flex justify-end mt-6">
            <button
              onClick={onAddNewQuestion}
              className="bg-[#6766D5] text-white px-6 py-1 rounded-full font-semibold hover:bg-[#5a59c7] transition-colors duration-200 shadow-md"
            >
              + Add New Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveResults;
