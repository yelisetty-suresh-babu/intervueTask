import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSocket, type RootState } from "../store";

interface ChatMessage {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

const StudentChat = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const { userId, userName } = useSelector((state: RootState) => state.poll);

  useEffect(() => {
    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("studentMessage", handleMessage);
    return () => {
      socket.off("studentMessage", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData: ChatMessage = {
        userId,
        userName,
        text: newMessage.trim(),
        timestamp: Date.now(),
      };
      socket.emit("studentMessage", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col space-y-3">
        {messages.map((m, idx) => {
          const isOwn = m.userId === userId;
          return (
            <div
              key={idx}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              {!isOwn && (
                <span className="text-xs font-semibold text-gray-600 mb-1">
                  {m.userName}
                </span>
              )}
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                  isOwn
                    ? "bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p>{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex p-2 border-t border-gray-200">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default StudentChat;
