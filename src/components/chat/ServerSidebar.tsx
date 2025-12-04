import React from "react";
import { Guild } from "@/utils/guild/types";
import Link from "next/link";
import CategoryTitle from "./CategoryTitle";


type Props = {
  guilds: Guild[];
  selectedGuild: Guild | null;
  setSelectedGuild: (guild: Guild) => void;
  setIsModalOpen: (open: boolean) => void;
  onRightClickGuild?: (e: React.MouseEvent, guild: Guild) => void;
  userAvatar?: string;
  userName?: string;
};

export default function ServerSidebar({
  guilds,
  selectedGuild,
  setSelectedGuild,
  setIsModalOpen,
  onRightClickGuild,
  userAvatar,
  userName = 'User',
}: Props) {
  const getColorFromUsername = (username: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return colors[username.charCodeAt(0) % colors.length];
  }
  return (
    <aside className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
      <CategoryTitle title= "User"/>
      <Link href ="/profile">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer overflow-hidden hover:ring-2 hover:ring-blue-500"
          style={{
            backgroundColor: userAvatar ? "transparent" : getColorFromUsername(userName),
          }}
          title="User Profile"
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            userName[0]?.toUpperCase() || "U"
          )}
        </div>
      </Link>
      <CategoryTitle title= "Create"/>
      <button
        className="w-12 h-12 bg-gray-700 rounded-full hover:bg-gray-600"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>
      <CategoryTitle title= "Servers"/>
      {guilds.map((guild) => (
        <div
          key={guild.id}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer
            ${
              selectedGuild?.id === guild.id ? "bg-blue-500" : "bg-gray-700"
            } hover:bg-blue-600`}
          title={guild.name}
          onClick={() => setSelectedGuild(guild)}
          onContextMenu={(e) => onRightClickGuild?.(e, guild)}
        >
          {guild.name[0]?.toUpperCase() || "G"}
        </div>
      ))}
    </aside>
  );
}
