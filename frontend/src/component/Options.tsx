interface OptionItemProps {
  index: number;
  option: {
    value: string;
    isCorrect: boolean | null;
  };
  onValueChange: (index: number, value: string) => void;
  onCorrectChange: (index: number, isCorrect: boolean) => void;
  onRemove: (index: number) => void;
}
const OptionItem = ({
  index,
  option,
  onValueChange,
  onCorrectChange,
  onRemove,
}: OptionItemProps) => {
  return (
    <div className="grid grid-cols-2 gap-x-8 mb-4 px-10">
      {/* Option Input */}
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-[#4E377B] to-[#8F64E1]  rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 text-white">
          {index + 1}
        </div>

        <input
          type="text"
          className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full text-base border-gray-300 rounded-lg p-2.5 placeholder-gray-400"
          placeholder={`Option ${String.fromCharCode(65 + index)}`}
          value={option.value}
          onChange={(e) => onValueChange(index, e.target.value)}
        />
      </div>

      {/* Correct? Yes / No */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="radio"
            className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
            name={`correct-${index}`}
            id={`correct-${index}-yes`}
            checked={option.isCorrect === true}
            onChange={() => onCorrectChange(index, true)}
          />
          <label
            htmlFor={`correct-${index}-yes`}
            className="text-gray-700 text-sm font-medium"
          >
            Yes
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-2"
            name={`correct-${index}`}
            id={`correct-${index}-no`}
            checked={option.isCorrect === false}
            onChange={() => onCorrectChange(index, false)}
          />
          <label
            htmlFor={`correct-${index}-no`}
            className="text-gray-700 text-sm font-medium"
          >
            No
          </label>
        </div>

        {/* Remove option button */}
        {index > 1 && (
          <button
            onClick={() => onRemove(index)}
            className="ml-auto text-red-500 text-xs hover:underline"
          >
            x
          </button>
        )}
      </div>
    </div>
  );
};

export default OptionItem;
