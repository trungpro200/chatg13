/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import type { Guild } from "@/app/chat/page";

type Props = {
  selectedGuild: Guild | null;
  selectedChannel: string | null;
  setSelectedChannel: (channel: string) => void;
};

export default function Channel({
  selectedGuild,
  selectedChannel,
  setSelectedChannel,
}: Props) {
  return (
    <aside className="w-60 bg-gray-850 p-4 flex flex-col">
      <h2 className="font-bold mb-4">
        {selectedGuild ? selectedGuild.name : "Select a guild"}
      </h2>
      <nav className="space-y-2">
        <button
          className="block w-full text-left px-2 py-1 rounded hover:bg-gray-700"
          onClick={() => setSelectedChannel("general")}
        >
          # general
        </button>
        <button
          className="block w-full text-left px-2 py-1 rounded hover:bg-gray-700"
          onClick={() => setSelectedChannel("random")}
        >
          # random
        </button>
      </nav>
    </aside>
  );
}
