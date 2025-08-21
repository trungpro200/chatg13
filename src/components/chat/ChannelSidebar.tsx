/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Guild } from "@/app/chat/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

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

type ChannelProps = {
  channel_id: string;
  channel_name: string;
  setSelectedChannel: (id: string | null) => void;
  selectedChannel: string | null;
}

function Channel_({
  channel_id,
  channel_name,
  setSelectedChannel,
  selectedChannel,
}: ChannelProps) {
  const isActive = selectedChannel === channel_id;
  return (
    <div className={`flex items-center justify-between group px-2 py-1 rounded cursor-pointer
    ${isActive ? "bg-gray-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
    >
    <button
      className="w-full text-left px-2 py-1 rounded hover:bg-gray-700 text-gray-300"
      onClick={() => setSelectedChannel(channel_id)}
    >
      #{channel_name}
    </button>
    {/* {Icon Settings} */}
    <button
      className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-white"
    >
      <Settings size={15}/>
      </button>
    </div>
    
  );}


export default function ChannelSidebar({
  selectedGuild,
  selectedChannel,
  setSelectedChannel,
}: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [open, setOpen] = useState(false); // state mở modal

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
  const handleAddChannel = async () => {
    if (!selectedGuild || !newChannelName.trim()) return;

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name: newChannelName, guild_id: selectedGuild.id }])
      .select()
      .single();

    if (error) {
      console.error("Error adding channel:", error);
      return;
    }

    setChannels((prev) => [...prev, data]);
    setNewChannelName("");
    setOpen(false); // Đóng modal sau khi thêm channel
    setSelectedChannel(data.id); // Chọn channel mới tạo
  };

  return (
    <aside className="w-64 bg-gray-800 p-4 overflow-y-scroll">
      <h3 className="text-md font-bold mb-2">{selectedGuild?.name}</h3>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id}>
            <Channel_
              channel_id={channel.id}
              channel_name={channel.name}
              setSelectedChannel={setSelectedChannel}
              selectedChannel={selectedChannel} 
            />
          </li>
        ))}
        {channels.length === 0 && (
          <li className="text-gray-500 italic">No channels</li>
        )}
      </ul>
      {/* Form modal */}
      {selectedGuild && (
        <div className="mt-4">
          <Button
            onClick={() => setOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            + Add Channel
          </Button>
        </div>
      )}

      {/* Modal tạo channel */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter channel name..."
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="bg-gray-700 text-white mt-2"
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="bg-gray-600 hover:bg-gray-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddChannel}
              className="bg-green-600 hover:bg-green-700"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
