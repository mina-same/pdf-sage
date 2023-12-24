import React from "react";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { trpc } from "@/app/_trpc/client";

interface chatWrapperProps {
  fileId: string;
}

const ChatWrapper = ({ fileId }: chatWrapperProps) => {
  const {data, isLoading} = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refershInterval: (data) =>
        data?.status === "SUCCESS" || 
        data?.status === "FAILED" ? 
        false : 500,
    }
  );

  return (
    <div className="realitve min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between">
      <div className="flex-1 justify-between flex flex-col mb-28">
        <Messages />
      </div>

      <ChatInput />
    </div>
  );
};

export default ChatWrapper;
