import { Suspense } from "react";
import ChatLayout from "@components/chat/ChatLayout";
import { Loader2 } from "lucide-react";
import { ProfilePanelProvider } from "@components/profile/profile-panel-provider";
import { auth } from "auth";
import { redirect } from "next/navigation";

const ChatPage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUserId = Number(session.user.id);
  return (
    <ProfilePanelProvider currentUserId={currentUserId}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "#2D75FB" }}
            />
          </div>
        }
      >
        <ChatLayout />
      </Suspense>
    </ProfilePanelProvider>
  );
};

export default ChatPage;
