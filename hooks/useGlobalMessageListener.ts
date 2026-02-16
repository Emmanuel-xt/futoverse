'use client'

import { useEffect } from "react";
import socket from "@lib/socket";
import { useSession } from "next-auth/react";
import useSidebarConversations from "zustand/useSidebarConversations";

const useGlobalMessageListener = () => {
    const { data: session } = useSession();
    const { updateConversations } = useSidebarConversations();

    useEffect(() => {
        socket.on("newMessage", (newMessage) => {
            // ✅ Update sidebar conversation ordering
            console.log('New Message from Global Listener', newMessage)
            updateConversations(newMessage, session?.user?.id);

            // ✅ Optional UI effects
            const sound = new Audio("/sounds/notification.mp3");
            sound.play();

            // Optionally add .shouldShake etc.
        });

        return () => {
            socket.off("newMessage");
        };
    }, [session, updateConversations, socket]);
};

export default useGlobalMessageListener;
