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
          <p className="text-sm text-gray-500">No conversations found.</p>
        )
      )}

      {loading && <p className="text-sm">Loading previous conversations...</p>}
    </div>
  );
};

export default Conversations;
