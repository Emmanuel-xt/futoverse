"use client";

// import Conversations from "./Conversations";
// import LogoutButton from "./LogoutButton";
// import SearchInput from "./SearchInput";

import useConversation from "zustand/useConversation";
import Conversations from "./Conversations";
import SearchInput from "./SearchInput";
import { useState } from "react";

const Sidebar = () => {
  const { setSelectedConversation, selectedConversation } = useConversation();
  const [searchResults, setSearchResults] = useState(null); // 💡 shared search result

  return (
    <div
      className={`border-r mb-10 border-slate-500 p-1 px-3 md:p-4 flex flex-col w-full lg:w-1/3 ${
        selectedConversation && "hidden md:flex"
      }`}
    >
      <h2 className="text-2xl font-Semibold mb-4">Chat</h2>
      <SearchInput setSearchResults={setSearchResults} />
      {/* <div className="divider px-3" /> */}
      <Conversations searchResults={searchResults} />
      {/* <LogoutButton /> */}
    </div>
  );
};
export default Sidebar;
