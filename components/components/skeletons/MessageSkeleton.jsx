import { Skeleton } from "@components/ui/skeleton";

const MessageSkeleton = ({ isOwnMessage }) => {
  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } my-2 px-3`}
    >
      <div className="flex flex-col gap-2 max-w-[70%]">
        <div className="flex items-center gap-2">
          {!isOwnMessage && <Skeleton className="w-8 h-8 rounded-full" />}
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-5 w-full rounded-md" />
      </div>
    </div>
  );
};

export default MessageSkeleton;
