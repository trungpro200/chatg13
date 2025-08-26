"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Message from "@/components/chat/Message";
import NewModal from "@/components/chat/NewModal";
import ServerSidebar from "@/components/chat/ServerSidebar";
import ChannelSidebar from "@/components/chat/ChannelSidebar";
import ContextMenu from "@/components/ContextMenu";
import RenameModal from "@/components/chat/RenameModal";
import LeaveGuildModal from "@/components/chat/LeaveGuildModal";
import { getGuildInvite, createInvite } from "@/utils/guild/invite";
import { Guild } from "@/utils/guild/types";

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const router = useRouter();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Guild | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<Guild | null>(null);

  const [guildContextMenu, setGuildContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    guild: Guild | null;
  }>({ visible: false, x: 0, y: 0, guild: null });

  const handleRightClickGuild = (e: React.MouseEvent, guild: Guild) => {
    setGuildContextMenu({
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

  async function handleInvite(guild: Guild | null) {
    if (!guild) return;

    let invite = await getGuildInvite(guild);
    if (invite) {
      //Return existed invite to user
      alert(`Invite created! ID: ${invite.id}`);
      return;
    }
    invite = await createInvite(guild);

    if (!invite) {
      return;
    }

    alert(`Invite created! ID: ${invite.id}`);
  }

  /*Dynamically update guild list*/
  useEffect(() => {
    // Fetch guilds for the logged-in user
    const fetchGuilds = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Select guilds where user is a member or owner (RLS will enforce)
      const { data, error } = await supabase
        .from("guilds")
        .select("id, name, owner_id, guild_members!inner(user_id)")
        .eq("guild_members.user_id", session.user.id);
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
        guildId={renameTarget?.id ? Number(renameTarget.id) : null}
        initialName={renameTarget?.name}
        onClose={() => setIsRenameModalOpen(false)}
        onRenameSuccess={(guildId, newName) => {
          setGuilds((prev) =>
            prev.map((g) =>
              Number(g.id) === guildId ? { ...g, name: newName } : g
            )
          );
          setSelectedGuild((prev) =>
            prev && Number(prev.id) === guildId
              ? { ...prev, name: newName }
              : prev
          );
        }}
      />

      <LeaveGuildModal
        isOpen={isLeaveModalOpen}
        guildId={leaveTarget?.id ? Number(leaveTarget.id) : null}
        onClose={() => setIsLeaveModalOpen(false)}
        onLeaveSuccess={(guildId) => {
          setGuilds((prev) => prev.filter((g) => Number(g.id) !== guildId));
          if (selectedGuild && Number(selectedGuild.id) === guildId)
            setSelectedGuild(null);
        }}
      />

      {/* Context menu for guild actions */}
      {guildContextMenu.visible && (
        <ContextMenu
          x={guildContextMenu.x}
          y={guildContextMenu.y}
          guild={guildContextMenu.guild}
          onClose={() =>
            setGuildContextMenu({ ...guildContextMenu, visible: false })
          }
          labels={["Rename Guild", "Invite People", "Leave Guild"]}
          onClicks={[
            () => {
              setRenameTarget(guildContextMenu.guild);
              setIsRenameModalOpen(true);
            },
            () => {
              handleInvite(guildContextMenu.guild);
              setGuildContextMenu({ ...guildContextMenu, visible: false });
            },
            () => {
              setLeaveTarget(guildContextMenu.guild);
              setIsLeaveModalOpen(true);
            },
          ]}
        />
      )}
    </main>
  );
}
