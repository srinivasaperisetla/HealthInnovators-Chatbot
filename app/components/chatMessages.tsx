'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function HumanMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex gap-3 items-start max-w-sm">
        <div className="flex flex-col items-end space-y-1">
          <div className="text-sm font-medium text-right text-zinc-100">You</div>
          <div className="rounded-lg bg-[#2b2b2b] px-3 py-2 text-sm text-white">
            {text}
          </div>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatars/human.png" alt="Human" />
          <AvatarFallback>H</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export function AIMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 items-start max-w-sm">
        <Avatar className="h-8 w-8 bg-blue-600">
          <AvatarImage src="/avatars/gemini.jpg" alt="Gemini" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <div className="text-sm font-medium text-white">Gemini</div>
          <div className="rounded-lg px-3 py-2 text-sm text-white">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

