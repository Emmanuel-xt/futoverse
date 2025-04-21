import { getRandomEmoji } from "@constants/arrays";
import useGetConversations from "hooks/useGetConversations";
import Conversation from "./Conversation";
import { useEffect } from "react";

const Conversations = ({ searchResults }) => {
  const { conversations: allConversations, loading } = useGetConversations();
  const displayConversations = searchResults?.conversations || allConversations;
  const newUsers = searchResults?.users || [];

  useEffect(() => {
    console.log(
      "Sidebar re-rendered with updated conversations",
      allConversations
    );
  }, [allConversations]);

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {displayConversations.length > 0 && (
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
      )}

      {newUsers.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-1">
            Other Users
          </h3>
          {newUsers.map((user) => (
            <Conversation
              key={user.id}
              conversation={user} // Still use Conversation component
              emoji={getRandomEmoji()}
              isUserOnly={true} // optionally distinguish visually
            />
          ))}
        </>
      )}

      {loading && <p className="">Loading Previous Conversation...</p>}
    </div>
  );
};

export default Conversations;
