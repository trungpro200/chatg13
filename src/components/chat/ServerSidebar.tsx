import React from "react";
import type { Guild } from "@/app/chat/page";

type Props = {
  guilds: Guild[];
  selectedGuild: Guild | null;
  setSelectedGuild: (guild: Guild) => void;
  setIsModalOpen: (open: boolean) => void;
};

export default function ServerSidebar({
  guilds,
  selectedGuild,
  setSelectedGuild,
  setIsModalOpen,
}: Props) {
  return (
    <aside className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
      <button
        className="w-12 h-12 bg-gray-700 rounded-full hover:bg-gray-600"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>
      {guilds.map((guild) => (
        <div
          key={guild.id}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer
            ${
              selectedGuild?.id === guild.id ? "bg-blue-500" : "bg-gray-700"
            } hover:bg-blue-600`}
          title={guild.name}
          onClick={() => setSelectedGuild(guild)}
        >
          {guild.name[0]?.toUpperCase() || "G"}
        </div>
      ))}
    </aside>
  );
}
