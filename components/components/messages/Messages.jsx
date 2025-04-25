import useChatScroll from "hooks/useChatScroll";
import useGetMessages from "hooks/useGetMessages";
import Message from "./Message";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import useListenMessages from "hooks/useListenMessages";
import { groupMessagesByDate } from "@constants/functions";
// import { groupMessagesByDate } from "@utils/groupMessagesByDate";

const Messages = () => {
  const { loading, messages } = useGetMessages();
  useListenMessages();

  const ref = useChatScroll(messages);

  const grouped = groupMessagesByDate(messages || []);

  return (
    <div className="px-4 flex-1 overflow-auto z-30 bg-white" ref={ref}>
      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {!loading &&
        Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="mb-4">
            <div className="text-center text-xs text-gray-500 my-4">{date}</div>
            {msgs.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        ))}

      {!loading && messages.length === 0 && (
        <p className="text-center text-gray-400">
          Send a message to start the conversation
        </p>
      )}
    </div>
  );
};
export default Messages;
