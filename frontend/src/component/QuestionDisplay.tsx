import { useState } from "react";
import type { Question } from "../interface/types";

interface QuizQuestionProps {
  activeQuestion: Question;
  remainingTime: number | null;
  hasUserVoted: boolean;
  hasTimeExpired: boolean;
  onSubmitAnswer: (optionText: string) => void;
}

const QuizQuestion = ({
  activeQuestion,
  remainingTime,
  hasUserVoted,
  hasTimeExpired,
  onSubmitAnswer,
}: QuizQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const formatTime = (ms: number | null): string => {
    if (ms === null) return "00:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmitAnswer(activeQuestion.options[selectedOption].text);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-xl">
        {/* Question header */}
        <div className="flex justify-start items-center mb-3 px-2 gap-x-4">
          <h2 className="text-lg font-semibold text-black">Question</h2>
          <div className="flex items-center space-x-1">
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-500 font-semibold text-sm">
              {formatTime(remainingTime)}
            </span>
          </div>
        </div>

        {/* Question box */}
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 text-sm font-semibold">
            {activeQuestion.text}
          </div>

          <div className="p-4 space-y-3">
            {activeQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                disabled={hasTimeExpired || hasUserVoted}
                className={`w-full flex items-center px-4 py-2 border rounded-md text-left ${
                  selectedOption === index
                    ? "border-[#4F0DCE] bg-white"
                    : "border-transparent bg-gray-100"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full border mr-3 ${
                    selectedOption === index
                      ? "bg-purple-100 text-[#7765DA] border-[#4F0DCE]"
                      : "bg-gray-200 text-gray-600 border-gray-300"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm font-medium ${
                    selectedOption === index ? "text-black" : "text-gray-700"
                  }`}
                >
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        {!hasUserVoted && !hasTimeExpired ? (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white px-8 py-2 rounded-full shadow-md hover:from-[#7765DA] hover:to-[#4F0DCE] focus:outline-none"
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-6">
            <p className="text-lg font-semibold text-black">
              {hasTimeExpired
                ? "Time has expired!"
                : "You have already answered"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizQuestion;
