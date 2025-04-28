import { getRandomEmoji } from "@constants/arrays";
import useGetConversations from "hooks/useGetConversations";
import Conversation from "./Conversation";

const Conversations = ({ searchResults }) => {
  const { conversations: allConversations, loading } = useGetConversations();
  const displayConversations = searchResults?.conversations || allConversations;

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {displayConversations.length > 0 ? (
        <>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            Your Chats
          </h3>
          {displayConversations.map((conversation) => (
            <Conversation
              key={conversation.id}
              conversation={conversation}
              emoji={getRandomEmoji()}
            />
          ))}
        </>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v9a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold">No Chats yet</h3>
            <p className="text-sm text-center mt-2">
              Start chatting with someone to see chats here!
            </p>
          </div>
        )
      )}

      {loading && <p className="text-sm"></p>}
    </div>
  );
};

export default Conversations;
