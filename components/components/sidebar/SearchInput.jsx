import { searchUsers } from "@lib/actions/user.prisma";
import useGetConversations from "hooks/useGetConversations";
import { Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "zustand/useConversation";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const { conversations } = useGetConversations();

  const handleSubmit = async (e) => {
    // e.preventDefault();
    if (!search) return;
    if (search.length < 3) {
      return toast("Search term must be at least 3 characters long");
    }
    const searchTerm = search.toLowerCase();
    // Step 1: Try to find a conversation that matches the search
    const matchedConversations = conversations.filter((c) =>
      c?.name?.toLowerCase().includes(searchTerm)
    );
    try {
      const matchedUsers = await searchUsers(search); // 👈 Search in DB
      const existingIds = new Set(conversations.map((c) => c.id));

      const newUsers = matchedUsers.filter((u) => !existingIds.has(u.id)); // exclude existing convos

      if (matchedConversations.length === 0 && newUsers.length === 0) {
        toast.error("No results found");
        return;
      }

      // Update searchResults in parent
      setSearchResults({
        conversations: matchedConversations,
        users: newUsers,
      });
    } catch (err) {
      console.error(err);
      toast.error("Search failed.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search…"
        className="w-full border rounded-full p-2 px-3 outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSubmit} className="text-sky-500">
        <Search className="text-lg font-bold" />
      </button>
    </div>
  );
};

export default SearchInput;
