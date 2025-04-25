"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useGetConversations from "hooks/useGetConversations";

const SearchInput = ({ setSearchResults }) => {
  const [search, setSearch] = useState("");
  const { conversations } = useGetConversations();

  useEffect(() => {
    if (!search) {
      setSearchResults({ conversations }); // show all
      return;
    }

    if (search.length < 3) {
      setSearchResults({ conversations: [] }); // too short to filter
      return;
    }

    const searchTerm = search.toLowerCase();
    const matchedConversations = conversations.filter((c) =>
      c?.name?.toLowerCase().includes(searchTerm)
    );

    setSearchResults({ conversations: matchedConversations });
  }, [search, conversations, setSearchResults]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search conversations…"
        className="w-full border rounded-full p-2 px-3 outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="text-sky-500" disabled>
        <Search className="text-lg font-bold" />
      </button>
    </div>
  );
};

export default SearchInput;
