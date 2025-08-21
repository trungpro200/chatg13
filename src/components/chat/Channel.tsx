/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Guild } from "@/app/chat/page";

type Channel = {
  id: string;
  name: string;
  guild_id: string;
};

type Props = {
  selectedGuild: Guild | null;
  selectedChannel: string | null;
  setSelectedChannel: (id: string | null) => void;
};

export default function Channel({
  selectedGuild,
  selectedChannel,
  setSelectedChannel,
}: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedGuild) {
        setChannels([]);
        return;
      }
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("guild_id", selectedGuild.id);

      if (error) {
        console.error("Error fetching channels:", error);
        setChannels([]);
        return;
      }
      setChannels(data || []);
    };

    fetchChannels();
  }, [selectedGuild]);

  return (
    <aside className="w-64 bg-gray-800 p-4">
      <h3 className="text-md font-bold mb-2">{selectedGuild?.name}</h3>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id}>
            <button
              className={`w-full text-left px-2 py-1 rounded ${
                selectedChannel === channel.id
                  ? "bg-blue-700 text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              #{channel.name}
            </button>
          </li>
        ))}
        {channels.length === 0 && (
          <li className="text-gray-500 italic">No channels</li>
        )}
      </ul>
    </aside>
  );
}
