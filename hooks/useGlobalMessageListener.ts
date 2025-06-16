'use client'

import { useEffect } from "react";
import socket from "@components/socket/Socket";
import { useSession } from "next-auth/react";
import useSidebarConversations from "zustand/useSidebarConversations";

const useGlobalMessageListener = () => {
    const { data: session } = useSession();
    const { updateConversations } = useSidebarConversations();

    useEffect(() => {
        socket.on("newMessage", (newMessage) => {
            // ✅ Update sidebar conversation ordering
            updateConversations(newMessage);

            // ✅ Optional UI effects
            // const sound = new Audio("/sounds/notification.mp3");
            // sound.play();

            // Optionally add .shouldShake etc.
        });

        return () => {
            socket.off("newMessage");
        };
    }, [session, updateConversations]);
};

export default useGlobalMessageListener;
