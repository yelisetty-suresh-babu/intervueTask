import { useState } from "react";
import OptionItem from "./Options";
import Dropdown from "./Dropdown";

interface CreatePollProps {
  setQuestionTimeLimit: React.Dispatch<React.SetStateAction<number>>;
  isPostingQuestion: boolean;
  isQuestionActive: boolean;
  handlePostQuestion: (questionText: string, options: string[]) => void;
  questionTimeLimit: number;
  setHistory: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreatePoll = ({
  setQuestionTimeLimit,
  isPostingQuestion,
  isQuestionActive,
  handlePostQuestion,
  questionTimeLimit,
  setHistory,
}: CreatePollProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<
    {
      value: string;
      isCorrect: boolean | null;
    }[]
  >([
    { value: "", isCorrect: null },
    { value: "", isCorrect: null },
  ]);

  // Handlers
  const handleValueChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index].value = value;
    setOptions(updated);
  };

  const handleCorrectChange = (index: number, isCorrect: boolean) => {
    const updated = [...options];
    updated[index].isCorrect = isCorrect;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { value: "", isCorrect: null }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log({
      question,
      options,
    });
    handlePostQuestion(
      question,
      options.map((opt) => opt.value)
    );
  };

  return (
    <div className="bg-white rounded-lg  mx-auto py-5 px-24  h-screen font-sora">
      {/* Header */}
      <div className="mb-4 px-10">
        <div className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white px-3 py-1.5 rounded-full inline-flex items-center text-xs font-semibold mb-4">
          <span className="mr-1">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.2762 8.76363C12.2775 8.96965 12.2148 9.17098 12.0969 9.33992C11.979 9.50887 11.8116 9.63711 11.6178 9.707L8.35572 10.907L7.15567 14.1671C7.08471 14.3604 6.95614 14.5272 6.78735 14.645C6.61855 14.7628 6.41766 14.826 6.21181 14.826C6.00596 14.826 5.80506 14.7628 5.63627 14.645C5.46747 14.5272 5.33891 14.3604 5.26794 14.1671L4.06537 10.9111L0.804778 9.71104C0.611716 9.63997 0.445097 9.5114 0.327404 9.34266C0.20971 9.17392 0.146606 8.97315 0.146606 8.76742C0.146606 8.56169 0.20971 8.36092 0.327404 8.19218C0.445097 8.02345 0.611716 7.89487 0.804778 7.82381L4.06688 6.62376L5.26693 3.36418C5.33799 3.17112 5.46657 3.0045 5.6353 2.88681C5.80404 2.76911 6.00482 2.70601 6.21054 2.70601C6.41627 2.70601 6.61705 2.76911 6.78578 2.88681C6.95452 3.0045 7.08309 3.17112 7.15416 3.36418L8.35421 6.62629L11.6138 7.82633C11.8074 7.8952 11.9749 8.02223 12.0935 8.19003C12.2121 8.35782 12.2759 8.55817 12.2762 8.76363ZM8.73923 2.70024H9.7498V3.71081C9.7498 3.84482 9.80303 3.97334 9.89779 4.06809C9.99255 4.16285 10.1211 4.21609 10.2551 4.21609C10.3891 4.21609 10.5176 4.16285 10.6124 4.06809C10.7071 3.97334 10.7604 3.84482 10.7604 3.71081V2.70024H11.7709C11.9049 2.70024 12.0335 2.64701 12.1282 2.55225C12.223 2.45749 12.2762 2.32897 12.2762 2.19496C12.2762 2.06095 12.223 1.93243 12.1282 1.83767C12.0335 1.74291 11.9049 1.68968 11.7709 1.68968H10.7604V0.679111C10.7604 0.545101 10.7071 0.416581 10.6124 0.321822C10.5176 0.227063 10.3891 0.173828 10.2551 0.173828C10.1211 0.173828 9.99255 0.227063 9.89779 0.321822C9.80303 0.416581 9.7498 0.545101 9.7498 0.679111V1.68968H8.73923C8.60522 1.68968 8.4767 1.74291 8.38194 1.83767C8.28718 1.93243 8.23395 2.06095 8.23395 2.19496C8.23395 2.32897 8.28718 2.45749 8.38194 2.55225C8.4767 2.64701 8.60522 2.70024 8.73923 2.70024ZM14.2973 4.72137H13.7921V4.21609C13.7921 4.08208 13.7388 3.95356 13.6441 3.8588C13.5493 3.76404 13.4208 3.71081 13.2868 3.71081C13.1528 3.71081 13.0242 3.76404 12.9295 3.8588C12.8347 3.95356 12.7815 4.08208 12.7815 4.21609V4.72137H12.2762C12.1422 4.72137 12.0137 4.77461 11.9189 4.86937C11.8242 4.96412 11.7709 5.09264 11.7709 5.22665C11.7709 5.36066 11.8242 5.48918 11.9189 5.58394C12.0137 5.6787 12.1422 5.73194 12.2762 5.73194H12.7815V6.23722C12.7815 6.37123 12.8347 6.49975 12.9295 6.59451C13.0242 6.68927 13.1528 6.7425 13.2868 6.7425C13.4208 6.7425 13.5493 6.68927 13.6441 6.59451C13.7388 6.49975 13.7921 6.37123 13.7921 6.23722V5.73194H14.2973C14.4313 5.73194 14.5599 5.6787 14.6546 5.58394C14.7494 5.48918 14.8026 5.36066 14.8026 5.22665C14.8026 5.09264 14.7494 4.96412 14.6546 4.86937C14.5599 4.77461 14.4313 4.72137 14.2973 4.72137Z"
                fill="white"
              />
            </svg>
          </span>
          Intervue Poll
        </div>
        <h2 className="text-3xl font-normal text-gray-800 mb-2">
          Let's <span className="font-bold">Get Started</span>
        </h2>
        <p
          className="text- text-lg leading-relaxed w-[60%] font-medium"
          style={{ color: " rgba(0, 0, 0, 0.5) " }}
        >
          You'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>
      </div>

      {/* Question Input */}
      <div className="mb-6 px-10">
        <div className="flex w-full justify-between items-center mb-2">
          <label
            htmlFor="question"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Enter your question
          </label>
          <div className="pr-[350px] ">
            <Dropdown
              setQuestionTimeLimit={setQuestionTimeLimit}
              disabled={isPostingQuestion || isQuestionActive}
              questionTimeLimit={questionTimeLimit}
            />
          </div>
        </div>
        <textarea
          id="question"
          className=" w-[70%] shadow-sm focus:ring-purple-500 focus:border-purple-500 block  text-base border-gray-300 rounded-md p-3 placeholder-gray-400 resize-none bg-[#F2F2F2]"
          rows={4}
          placeholder="Type your question here..."
          maxLength={100}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
      </div>

      {/* Options */}
      <div className="flex justify-between px-11 mb-4 font-bold">
        <p>Edit Option</p>
        <p className="pl-10">Is it Correct?</p>
        <p></p>
      </div>
      {options.map((opt, idx) => (
        <OptionItem
          key={idx}
          index={idx}
          option={opt}
          onValueChange={handleValueChange}
          onCorrectChange={handleCorrectChange}
          onRemove={removeOption}
        />
      ))}

      {/* Add Option Button */}
      <div className="px-10 mb-6">
        <button
          onClick={addOption}
          className=" text-[#7C57C2] text-sm font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 outline-1 outline-[#7C57C2] hover:outline-[#6c51a0]"
        >
          + Add More Option
        </button>
      </div>

      {/* Submit Button */}
      <div className="border-t border-gray-200 pt-3 flex justify-between">
        <button
          onClick={() => {
            setHistory(true);
          }}
          className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white font-semibold py-2 px-10 rounded-full hover:from-[#6b5bc6] hover:to-[#460ab5] focus:outline-none "
        >
          <div className="flex items-center gap-x-4">
            <svg
              width="25"
              height="25"
              viewBox="0 0 31 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1_502)">
                <path
                  d="M15.5 6.125C9.25 6.125 3.9125 10.0125 1.75 15.5C3.9125 20.9875 9.25 24.875 15.5 24.875C21.7563 24.875 27.0875 20.9875 29.25 15.5C27.0875 10.0125 21.7563 6.125 15.5 6.125ZM15.5 21.75C12.05 21.75 9.25 18.95 9.25 15.5C9.25 12.05 12.05 9.25 15.5 9.25C18.95 9.25 21.75 12.05 21.75 15.5C21.75 18.95 18.95 21.75 15.5 21.75ZM15.5 11.75C13.4312 11.75 11.75 13.4313 11.75 15.5C11.75 17.5688 13.4312 19.25 15.5 19.25C17.5688 19.25 19.25 17.5688 19.25 15.5C19.25 13.4313 17.5688 11.75 15.5 11.75Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_502">
                  <rect
                    width="30"
                    height="30"
                    fill="white"
                    transform="translate(0.5 0.5)"
                  />
                </clipPath>
              </defs>
            </svg>

            <p>View Poll History</p>
          </div>
        </button>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white font-semibold py-2 px-10 rounded-full hover:from-[#6b5bc6] hover:to-[#460ab5] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md"
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default CreatePoll;
