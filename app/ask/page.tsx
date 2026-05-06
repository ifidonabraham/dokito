"use client";

import { DokitaChat } from "@/components/dokita/dokita-chat";

export default function AskDokitaPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem-5rem)] min-w-0 flex-col overflow-x-hidden lg:h-[calc(100vh-3.5rem)]">
      <DokitaChat />
    </div>
  );
}
