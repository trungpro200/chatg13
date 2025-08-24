"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Message from "@/components/chat/Message";
import NewModal from "@/components/chat/NewModal";
import ServerSidebar from "@/components/chat/ServerSidebar";
import ChannelSidebar from "@/components/chat/ChannelSidebar";
import RenameModal from "@/components/chat/RenameModal";

export type Guild = {
  id: string;
  name: string;
  owner_id?: string;
};

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const router = useRouter();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Guild | null>(null);


const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    guild: Guild | null;
  }>({ visible: false, x: 0, y: 0, guild: null });

  const handleRightClickGuild = (e: React.MouseEvent, guild: Guild) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      guild,
    });
  };

  const handleCreateGuild = async (guildName: string) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      alert("You must be logged in to create a guild.");
      return;
    }

    const user = session.user;

    // Insert guild
    const { data: guild, error: guildError } = await supabase
      .from("guilds")
      .insert({
        name: guildName,
        owner_id: user.id,
      })
      .select()
      .single();

    if (guildError) {
      console.error("Guild insert error:", guildError); // <-- Add this line
      alert("Error creating guild: " + guildError.message);
      return;
    }

    // Add creator as member
    const { error: memberError } = await supabase.from("guild_members").insert({
      guild_id: guild.id,
      user_id: user.id,
    });

    if (memberError) {
      alert(
        "Guild created, but failed to add you as member: " + memberError.message
      );
      return;
    }

    // Success
    alert(`Guild "${guild.name}" created!`);
    setIsModalOpen(false);
    setMode(null);

    // Redirect to the new guild later (for now just refresh chat page)
    router.refresh();
  };

const handleRenameGuild = async (guildId: string, newName: string) => { // Thay tên nhóm
  // update ở local state
  setGuilds((prev) =>
    prev.map((g) => (g.id === guildId ? { ...g, name: newName } : g))
  );
  setSelectedGuild((prev) =>
    prev && prev.id === guildId ? { ...prev, name: newName } : prev
  );

  // gọi supabase update
  const { error } = await supabase
    .from("guilds")
    .update({ name: newName })
    .eq("id", guildId);

  if (error) {
    console.error("Error renaming guild:", error);
    alert("Đổi tên thất bại: " + error.message);
  }
};


const handleLeaveGuild = async (guildId: string) => { // Rời nhóm
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { error } = await supabase
    .from("guild_members")
    .delete()
    .eq("guild_id", guildId)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error leaving guild:", error);
    alert("Rời nhóm thất bại: " + error.message);
    return;
  }

  // cập nhật lại state local
  setGuilds((prev) => prev.filter((g) => g.id !== guildId));
  if (selectedGuild?.id === guildId) {
    setSelectedGuild(null);
  }
};


  useEffect(() => {
    // Fetch guilds for the logged-in user
    const fetchGuilds = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Select guilds where user is a member or owner (RLS will enforce)
      const { data, error } = await supabase.from("guilds").select("id, name, owner_id, guild_members!inner(user_id)").eq("guild_members.user_id", session.user.id);
      if (error) {
        console.error("Error fetching guilds:", error);
        return;
      }
      setGuilds(data || []);
      if (data && data.length > 0 && !selectedGuild) {
        setSelectedGuild(data[0]);
      }
    };
    fetchGuilds();
  }, [isModalOpen, selectedGuild]);

useEffect(() => {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault(); // chặn context menu mặc định ở mọi nơi
  };
  window.addEventListener("contextmenu", handleContextMenu);
  return () => window.removeEventListener("contextmenu", handleContextMenu);
}, []);


useEffect(() => { // đóng menu guild khi nhấp click ngoài menu
  const handleClick = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };
  window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
}, [contextMenu]);

  return (
    <main className="flex h-screen bg-gray-900 text-white">
      <ServerSidebar
        guilds={guilds}
        selectedGuild={selectedGuild}
        setSelectedGuild={setSelectedGuild}
        setIsModalOpen={setIsModalOpen}
        onRightClickGuild={handleRightClickGuild}
      />
      <ChannelSidebar
        selectedGuild={selectedGuild}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />
      <Message selectedChannel={selectedChannel} />

      {/* New guild Modal */}
      <NewModal
        isOpen={isModalOpen}
        mode={mode}
        setIsOpen={setIsModalOpen}
        setMode={setMode}
        handleCreateGuild={handleCreateGuild}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        guild={renameTarget}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameGuild}
      />


      {contextMenu.visible && contextMenu.guild && (
        <ul
          className="absolute bg-gray-800 text-white shadow-lg rounded-md py-2 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <li
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              setRenameTarget(contextMenu.guild);
              setIsRenameModalOpen(true);
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            Đổi tên nhóm
          </li>
          <li
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              if (contextMenu.guild) handleLeaveGuild(contextMenu.guild.id);
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            Rời nhóm
          </li>
        </ul>
      )}

    </main>
  );
}
