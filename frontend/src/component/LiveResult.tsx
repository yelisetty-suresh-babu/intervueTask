import React from "react";
import type { Question } from "../interface/types";

interface LiveResultsProps {
  activeQuestion: Question;
  isHistory?: boolean;
}

const LiveResults: React.FC<LiveResultsProps> = ({
  activeQuestion,
  isHistory,
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
          <h2 className="text-lg font-semibold text-black">Question </h2>
        </div>

        {/* Question Box */}
        <div className="border border-gray-300 rounded-md overflow-hidden">
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
                  className="w-full flex items-center px-2 py-2 bg-gray-100 rounded-md relative overflow-hidden border"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-[#6766D5] rounded-md transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="flex items-center relative z-10 w-full justify-between px-2">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full border mr-3 bg-purple-100 text-[#6766D5] outline-[#6766D5]">
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
      </div>
    </div>
  );
};

export default LiveResults;
