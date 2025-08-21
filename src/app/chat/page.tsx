"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Server from "@/components/chat/ServerSidebar";
import Channel from "@/components/chat/Channel";
import Message from "@/components/chat/Message";
import NewModal from "@/components/chat/NewModal";
import ServerSidebar from "@/components/chat/ServerSidebar";

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

  useEffect(() => {
    // Fetch guilds for the logged-in user
    const fetchGuilds = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Select guilds where user is a member or owner (RLS will enforce)
      const { data, error } = await supabase.from("guilds").select("*");
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

  return (
    <main className="flex h-screen bg-gray-900 text-white">
      <ServerSidebar
        guilds={guilds}
        selectedGuild={selectedGuild}
        setSelectedGuild={setSelectedGuild}
        setIsModalOpen={setIsModalOpen}
      />
      <Channel
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
    </main>
  );
}
