// "use client";

// import { useState, useRef, useEffect } from "react";
// import {
//   Send,
//   Mic,
//   MicOff,
//   Paperclip,
//   Smile,
//   X,
//   Play,
//   Pause,
// } from "lucide-react";
// import { Button } from "@components/ui/button";
// import { Textarea } from "@components/ui/textarea";
// import useSendMessage from "hooks/useSendMessage";
// import useVoiceRecording from "hooks/useVoiceRecording";
// import useTypingIndicator from "hooks/useTypingIndicator";
// import { cn } from "@lib/utils";
// import EmojiPicker from "./EmojiPicker";
// import ImageUpload from "./ImageUpload";

// const MessageInput = () => {
//   const [message, setMessage] = useState("");
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [showImageUpload, setShowImageUpload] = useState(false);
//   const textareaRef = useRef(null);
//   const { loading, sendMessage } = useSendMessage();
//   const { startTyping, stopTyping } = useTypingIndicator();

//   //   const {
//   //     isRecording,
//   //     recordingTime,
//   //     audioBlob,
//   //     startRecording,
//   //     stopRecording,
//   //     cancelRecording,
//   //     isPlaying,
//   //     playRecording,
//   //     pauseRecording,
//   //   } = useVoiceRecording();

//   const isRecording = false;
//   const audioBlob = false;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;
//     // if (!message.trim() && !audioBlob) return;

//     stopTyping();

//     // if (audioBlob) {
//     if (false) {
//       // Send voice message
//       console.log("Voice message");
//       //   await sendMessage("", "VOICE", audioBlob);
//       //   cancelRecording();
//     } else {
//       // Send text message
//       await sendMessage(message);
//       setMessage("");
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   const handleMessageChange = (e) => {
//     const value = e.target.value;
//     setMessage(value);
//   };

//   useEffect(() => {
//     if (message.trim()) {
//       startTyping();
//     } else {
//       stopTyping();
//     }
//   }, [message, startTyping, stopTyping]);

//   const handleEmojiSelect = (emoji) => {
//     setMessage((prev) => prev + emoji);
//     setShowEmoji(false);
//     textareaRef.current?.focus();
//   };

//   const handleImageUpload = async (file) => {
//     await sendMessage("", "IMAGE", file);
//     setShowImageUpload(false);
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${Math.min(
//         textareaRef.current.scrollHeight,
//         120
//       )}px`;
//     }
//   }, [message]);

//   // Stop typing when component unmounts
//   useEffect(() => {
//     return () => {
//       stopTyping();
//     };
//   }, [stopTyping]);

//   return (
//     <div className="bg-white border-t border-gray-200 p-4">
//       {/* Voice Recording UI */}
//       {/* {isRecording && (
//         <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
//               <span className="text-red-700 font-medium">
//                 Recording... {formatTime(recordingTime)}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={cancelRecording}
//                 className="text-red-600 hover:bg-red-100"
//               >
//                 <X className="w-4 h-4" />
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={stopRecording}
//                 className="text-red-600 hover:bg-red-100"
//               >
//                 <MicOff className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* Voice Preview */}
//       {/* {audioBlob && !isRecording && (
//         <div
//           className="mb-4 border rounded-lg p-4"
//           style={{ backgroundColor: "#E3F2FD", borderColor: "#2D75FB" }}
//         >
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={isPlaying ? pauseRecording : playRecording}
//                 className="hover:bg-blue-100"
//                 style={{ color: "#2D75FB" }}
//               >
//                 {isPlaying ? (
//                   <Pause className="w-4 h-4" />
//                 ) : (
//                   <Play className="w-4 h-4" />
//                 )}
//               </Button>
//               <span style={{ color: "#2D75FB" }}>Voice message ready</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={cancelRecording}
//                 className="text-red-600 hover:bg-red-100"
//               >
//                 <X className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       )} */}

//       <form onSubmit={handleSubmit} className="flex items-end space-x-2">
//         {/* Attachment Button */}
//         <Button
//           type="button"
//           variant="ghost"
//           size="sm"
//           className="p-2 text-gray-500 hover:text-gray-700"
//           onClick={() => setShowImageUpload(true)}
//         >
//           <Paperclip className="w-5 h-5" />
//         </Button>

//         {/* Message Input */}
//         <div className="flex-1 relative">
//           <div className="flex items-end bg-white border border-gray-300 rounded-3xl overflow-hidden">
//             <div className="flex-1 relative">
//               <Textarea
//                 ref={textareaRef}
//                 value={message}
//                 onChange={handleMessageChange}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type a message"
//                 className="resize-none border-0 focus:ring-0 rounded-3xl py-3 px-4 max-h-32 min-h-[48px] bg-transparent"
//                 rows={1}
//               />
//             </div>

//             <div className="flex items-center pr-2">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="p-2 text-gray-500 hover:text-gray-700"
//                 onClick={() => setShowEmoji(!showEmoji)}
//               >
//                 <Smile className="w-5 h-5" />
//               </Button>
//             </div>
//           </div>

//           {/* Emoji Picker */}
//           {showEmoji && (
//             <div className="absolute bottom-full right-0 mb-2 z-50">
//               <EmojiPicker onEmojiSelect={handleEmojiSelect} />
//             </div>
//           )}
//         </div>

//         {/* Send/Voice Button */}
//         {message.trim() || audioBlob ? (
//           <Button
//             type="submit"
//             disabled={loading}
//             className="rounded-full w-12 h-12 text-white p-0"
//             style={{ backgroundColor: "#2D75FB" }}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.backgroundColor = "#1E5FE0")
//             }
//             onMouseLeave={(e) =>
//               (e.currentTarget.style.backgroundColor = "#2D75FB")
//             }
//           >
//             {loading ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             ) : (
//               <Send className="w-5 h-5" />
//             )}
//           </Button>
//         ) : (
//           <Button
//             type="button"
//             // onMouseDown={startRecording}
//             // onMouseUp={stopRecording}
//             // onTouchStart={startRecording}
//             // onTouchEnd={stopRecording}
//             className={cn(
//               "rounded-full w-12 h-12 p-0 transition-colors text-white",
//               isRecording ? "bg-red-500 hover:bg-red-600" : ""
//             )}
//             style={!isRecording ? { backgroundColor: "#2D75FB" } : {}}
//             onMouseEnter={(e) => {
//               if (!isRecording)
//                 e.currentTarget.style.backgroundColor = "#1E5FE0";
//             }}
//             onMouseLeave={(e) => {
//               if (!isRecording)
//                 e.currentTarget.style.backgroundColor = "#2D75FB";
//             }}
//           >
//             <Mic className="w-5 h-5" />
//           </Button>
//         )}
//       </form>

//       {/* Image Upload Modal */}
//       <ImageUpload
//         open={showImageUpload}
//         onClose={() => setShowImageUpload(false)}
//         onUpload={handleImageUpload}
//       />
//     </div>
//   );
// };

// export default MessageInput;

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
            className=" text-sm block w-full p-2.5 bg-slate-200 rounded-2xl border-gray-600 text-black resize-none overflow-hidden outline-none"
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
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <Smile className="w-7 h-7" />
            </Button>
          </div>
          {message.trim() && (
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full w-10 h-10 text-white p-0 flex-shrink-0"
              style={{ backgroundColor: "#2D75FB" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1E5FE0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2D75FB")
              }
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
