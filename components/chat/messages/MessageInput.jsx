import { Button } from "@components/ui/button";
import useSendMessage from "hooks/useSendMessage";
import { Send, Smile } from "lucide-react";
import { useState } from "react";
import EmojiPicker from "./EmojiPicker";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(1);
  const { loading, sendMessage } = useSendMessage();
  const [showEmoji, setShowEmoji] = useState(false);

  const maxRows = 5; // Maximum rows allowed

  const handleChange = (e) => {
    const textareaLineHeight = 24; // Approximate height per line
    const previousRows = e.target.rows;
    e.target.rows = 1; // Reset rows to recalculate

    const currentRows = Math.floor(e.target.scrollHeight / textareaLineHeight);
    if (currentRows === previousRows) {
      e.target.rows = currentRows;
    }

    setMessage(e.target.value);
    setRows(currentRows < maxRows ? currentRows : maxRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage("");
    setRows(1); // Reset to 1 row after sending
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    // textareaRef.current?.focus();
  };

  return (
    <form
      className="fixed bottom-0 inset-x-0 z-30 px-2 bg-inherit"
      onSubmit={handleSubmit}
    >
      <div className="flex gap-1 py-4 relative">
        <div className="w-full flex gap-1 items-end  ">
          <textarea
            className=" text-sm block w-full p-2.5 bg-slate-200 dark:bg-gray-700 rounded-2xl border-gray-600 text-black dark:text-white resize-none overflow-hidden outline-none"
            placeholder="Send a message"
            value={message}
            onChange={handleChange}
            rows={rows} // Dynamically adjust rows
          />
          <div className="flex items-center pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <Smile className="w-7 h-7" />
            </Button>
          </div>
          {message.trim() && (
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full w-10 h-10 text-white p-0 flex-shrink-0 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
        {showEmoji && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;
