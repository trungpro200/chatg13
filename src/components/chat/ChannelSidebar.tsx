/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Guild } from "@/utils/guild/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Mic, Check, Search } from "lucide-react";
import { BsChatFill } from "react-icons/bs";
import { channel_types, Channel } from "@/utils/guild/types";
import SearchBar from "./Searchbar";

type ChannelProps = {
  channel: Channel;
  onSelectedChannel: (id: string ) => void;
  selectedChannel: string | null;
  disabled?: boolean;
  search: string;
};

type SidebarProps = {
  selectedGuild: Guild | null;
  selectedChannel: string | null;
  setSelectedChannel: (id: string | null) => void; //This shit referencing a useState Function
};

function highlightText(text: string, keyword: string) { //Highlight từ khóa được nhập
  if (!keyword.trim()) return text;

  const regex = new RegExp(`(${keyword})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-400 text-black">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function Channel_({
  channel,
  onSelectedChannel,
  selectedChannel,
  disabled,
  search,
}: ChannelProps) {
  const isActive = selectedChannel === channel.name;
  return (
    <div
      className={`flex items-center justify-between group px-2 py-1 rounded ${disabled ? "opacity-50 cursor-not-allowed": "cursor-pointer"}
    ${isActive && !disabled ? "bg-gray-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
    >
      <button
        disabled = {disabled}
        className="w-full flex items-center gap-2 text-left px-2 py-1 rounded text-gray-300
        disabled:cursor-not-allowed disabled:hover:bg-transparent"
        onClick={() => !disabled && onSelectedChannel(channel.name)} 
      >
        {channel.type === channel_types.TEXT ? (
          <span className="text-gray-400">
            <BsChatFill />
          </span>
        ) : (
          <Mic size={15} className="text-gray-400" />
        )}
        <span className="truncate">
          {highlightText(channel.name, search)}
        </span>
      </button>

      {/* {Icon Settings} */}
      <button 
        disabled = {disabled}
        className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-white disabled:opacity-0">
        <Settings size={15} />
      </button>
    </div>
  );
}

export default function ChannelSidebar({
  selectedGuild,
  selectedChannel,
  setSelectedChannel,
}: SidebarProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [open, setOpen] = useState(false); // state mở modal
  const [channelType, setchannelType] = useState<channel_types>(
    channel_types.TEXT
  );
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingChannel, setIsSwitchingChannel] = useState(false); // added
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedGuild) {
        setChannels([]);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("guild_id", selectedGuild.id);

      if (error) {
        console.error("Error fetching channels:", error);
        setChannels([]);
        return;
      }
      else {
        setChannels(data || []);
      }
      setIsLoading(false);
    };

    fetchChannels();
  }, [selectedGuild]);
  const handleAddChannel = async () => {
    if (!selectedGuild || !newChannelName.trim()) return;

    setIsCreatingChannel(true);

    const { data, error } = await supabase
      .from("channels")
      .insert([
        { name: newChannelName, guild_id: selectedGuild.id, type: channelType },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding channel:", error);
      setIsCreatingChannel(false);
      return;
    }

    setChannels((prev) => [...prev, data]);
    setNewChannelName("");
    setchannelType(channel_types.TEXT);
    setOpen(false); // Đóng modal sau khi thêm channel
    setSelectedChannel(data.id); // Chọn channel mới tạo

    setIsCreatingChannel(false);
    console.log("Channel created:", data);
  };

  const handleSelectChannel = (channelId: string) => {
    if (isSwitchingChannel) return; // chặn spam.
    setIsSwitchingChannel(true); // Bắt đầu quá trình chuyển kênh.
    setSelectedChannel(channelId);
    setTimeout(() => setIsSwitchingChannel(false), 500); // sau 500ms thì cho phép chuyển kênh tiếp.
  }

  // Lọc kênh theo từ khóa tìm kiếm
  const filtered = channels.filter((ch) =>
    ch.name.toLowerCase().includes(search.toLowerCase())
  );

  const text_Channels = filtered.filter((ch) => ch.type === channel_types.TEXT);
  const voice_Channels = filtered.filter((ch) => ch.type === channel_types.VOICE);

  return (
    <aside className="h-full w-full bg-gray-800 p-4 overflow-y-scroll">
      <h3 className="text-md font-bold mb-2">{selectedGuild?.name}</h3>

      {/* SEARCH BAR */}
      <SearchBar value={search} onChange={setSearch} placeholder="Search channels..." className="mb-3"/>

      <ul className="space-y-1">
        {/* --- TEXT CHANNELS --- */}
        <h4 className="text-gray-400 text-xs font-bold mt-2 mb-1 px-2">TEXT CHANNELS</h4>
        {text_Channels.length > 0 ? (
          text_Channels.map((channel) => (
            <li key={channel.id}>
              <Channel_
                channel={channel}
                onSelectedChannel={handleSelectChannel}
                selectedChannel={selectedChannel}
                disabled={isLoading || isSwitchingChannel}
                search={search}
              />
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic px-2">No text channels</li>
        )}

        {/* --- VOICE CHANNELS --- */}
        <h4 className="text-gray-400 text-xs font-bold mt-4 mb-1 px-2">VOICE CHANNELS</h4>
        {voice_Channels.length > 0 ? (
          voice_Channels.map((channel) => (
            <li key={channel.id}>
              <Channel_
                channel={channel}
                onSelectedChannel={handleSelectChannel}
                selectedChannel={selectedChannel}
                disabled={isLoading || isSwitchingChannel}
                search={search}
              />
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic px-2">No voice channels</li>
        )}
      </ul>
      {/* Form modal */}
      {selectedGuild && (
        <div className="mt-4">
          <Button
            onClick={() => setOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading || isSwitchingChannel} // disable nút load
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

          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => setchannelType(channel_types.TEXT)}
              className={`flex items-center justify-between px-3 py-2 rounded transition
                ${
                  channelType === channel_types.TEXT
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Text
            </Button>
            <Button
              onClick={() => setchannelType(channel_types.VOICE)}
              className={`flex items-center justify-between px-3 py-2 rounded transition
                ${
                  channelType === channel_types.VOICE
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Voice
            </Button>
          </div>

          <Input
            type="text"
            placeholder="Enter channel name..."
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="bg-gray-700 text-white mt-4"
          />

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="bg-gray-600 hover:bg-gray-500"
              disabled={isCreatingChannel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddChannel}
              className="bg-green-600 hover:bg-green-700"
              disabled={isCreatingChannel}
            >
              {isCreatingChannel ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
