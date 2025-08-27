import React, { useEffect, useState } from "react";
import { chatService, Message as MessageType } from "@/utils/guild/ChatService";
import { Guild } from "@/utils/guild/types";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  selectedChannel: string | null;
  selectedGuild: Guild | null;
};

export default function Message({ selectedChannel, selectedGuild }: Props) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [channelId, setChannelId] = useState<number | null>(null);

  useEffect(() => {
    setMessages([]);
    setChannelId(null);
  }, [selectedGuild]);

  useEffect(() => {
    const fetchChannelId = async () => {
      if (!selectedChannel) {
        setChannelId(null);
        setMessages([]);
        return;
      }
      const { data, error } = await supabase
        .from("channels")
        .select("id")
        .eq("name", selectedChannel)
        .maybeSingle();
      if (error || !data) return;
      setChannelId(data.id);
    };
    fetchChannelId();
  }, [selectedChannel]);

  useEffect(() => {
    if (!channelId) return;

    const load = async () => {
      const msgs = await chatService.fetchMessages(channelId);
      setMessages(msgs);
    };
    load();

    chatService.subscribeMessages(channelId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      chatService.unsubscribe();
    };
  }, [channelId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !channelId) return;
    const msg = await chatService.sendMessage(channelId, input);
    setMessages((prev) => [...prev, msg]);
    setInput("");

  };

  return (
    <section className="flex-1 flex flex-col">
      <header className="h-12 bg-gray-800 px-4 flex items-center border-b border-gray-700">
        <h3 className="font-semibold">
          {selectedChannel ? `# ${selectedChannel}` : "Select a channel"}
        </h3>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-gray-800 p-2 rounded text-sm text-gray-200"
          >
            <span className="text-gray-400 mr-2">{msg.user_id.slice(0, 6)}:</span>
            {msg.content}
          </div>
        ))}
      </div>
      {channelId && (
        <footer className="p-4 border-t border-gray-700">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Send
            </button>
          </form>
        </footer>
      )}
    </section>
  );
}
