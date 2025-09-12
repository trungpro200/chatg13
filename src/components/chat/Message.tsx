import React, { useEffect, useState, useRef} from "react";
import { chatService, Message as MessageType } from "@/utils/guild/ChatService";
import { Guild } from "@/utils/guild/types";
import { supabase } from "@/lib/supabaseClient";
import ContextMenu from "../ContextMenu";
import { FaThumbtack } from "react-icons/fa6";

type Props = {
  selectedChannel: string | null;
  selectedGuild: Guild | null;
  setSelectedChannel: (channel: string) => void;
};

export default function Message({ selectedChannel, selectedGuild, setSelectedChannel }: Props) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [channelId, setChannelId] = useState<number | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [pinnedMsg, setPinnedMsg] = useState<MessageType[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    message: MessageType | null;
  }>({ x: 0, y: 0, message: null });

  const [pinMenu, setPinMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({x: 0, y: 0,visible: false,});

  useEffect(() => { //Dynamic update on selectedGuild changes
    setMessages([]);
    setChannelId(null);
    setPinnedMsg([]);
    setSelectedChannel("Select a channel")
    console.log("Guild changed?")
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
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchUserProfile = async (userId: string) => {
    if (usernames[userId]) return usernames[userId];
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    const name = data?.email || "Unknown";
    setUsernames((prev) => ({ ...prev, [userId]: name }));
    return name;
  };

  useEffect(() => {
    if (!channelId) return;

    chatService.subscribeMessages(channelId, (msg) => {
      console.log("New message received via subscription:", msg);
      fetchUserProfile(msg.author_id);
      setMessages((prev) => {
        // prevent duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.pinned) {
        setPinnedMsg((prev = []) => [...prev, msg]);
      }
      scrollToBottom();
    });

    return () => {
      chatService.unsubscribe();
    };
  }, [channelId]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !channelId) return;
    await chatService.sendMessage(channelId, input);
    // setMessages((prev) => [...prev, msg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
    scrollToBottom();
  };

  const handleMenuClick = async (label: string, msg: MessageType) => {
    if (label === "Pin" || label === "Unpin") {
      const updated = await chatService.togglePinned(Number(msg.id), !msg.pinned);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? updated : m))
      );
      setPinnedMsg((prev) =>
        updated.pinned ? [...(prev ?? []), updated] : (prev ?? []).filter((m) => m.id !== msg.id)
      );
    }
    setMenu({ x: 0, y: 0, message: null }); // đóng menu
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px"; // reset trước khi tính lại
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const scrollToMessage = (msgId: string | number) => {
    const el = msgRefs.current[msgId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring", "ring-yellow-400");
      setTimeout(() => el.classList.remove("ring", "ring-yellow-400"), 2000);
    }
  };

  return (
    <section className="flex-1 flex flex-col">
      <header className="h-12 bg-gray-800 px-4 flex items-center border-b border-gray-700">
        <h3 className="font-semibold">
          {selectedChannel ? `# ${selectedChannel}` : "Select a channel"}
        </h3>
      </header>

      {pinnedMsg.length > 0 && (
        <div
          className="bg-yellow-700 text-white px-4 py-2 text-sm flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setPinMenu({ x: e.clientX, y: e.clientY, visible: true });
          }}
        >
          <FaThumbtack />
          <span>
            {pinnedMsg.length} pinned messages
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
            <div
              key={msg.id}
              ref={(el) => {
                (msgRefs.current[msg.id] = el)}
              }
              className="flex w-full justify-start"
            >
              <div
                className={`relative p-3 rounded-md shadow-lg inline-block break-all whitespace-pre-wrap max-w-[70%] ${
                  msg.pinned ? "bg-yellow-800" : "bg-gray-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600 text-white">
                    {msg.author_id?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-300">
                        {usernames[msg.author_id] || msg.author_id}
                      </span>
                      <button
                        className="px-2 text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenu({ x: e.clientX, y: e.clientY, message: msg });
                        }}
                      >
                        ...
                      </button>
                    </div>
                    <p className="text-gray-200 text-sm">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
      </div>

      {channelId && (
        <footer className="p-4 border-t border-gray-700">
          <form onSubmit={handleSend} className="flex gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Message..."
              value={input}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none resize-none overflow-hidden"
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

      {menu.message && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          guild={selectedGuild}
          labels={[
            <>
              <FaThumbtack className="inline mr-2" />
              {menu.message.pinned ? "Unpin" : "Pin"}
            </>,
          ]}
          onClicks={[
            () => handleMenuClick(menu.message!.pinned ? "Unpin" : "Pin", menu.message!)
          ]}
          onClose={() => setMenu({ x: 0, y: 0, message: null })}
        />
      )}

      {pinMenu.visible && (
        <ContextMenu
          x={pinMenu.x}
          y={pinMenu.y}
          guild={selectedGuild}
          labels={pinnedMsg.map((m) => (
            <span key={m.id} className="block truncate">
              <strong>{usernames[m.author_id] || m.author_id}</strong>: {m.content}
            </span>
          ))}
          onClose={() => setPinMenu({ ...pinMenu, visible: false })}
          onClicks={pinnedMsg.map((m) =>
            () => scrollToMessage(m.id)
          )}
          maxWidth="300px"
        />
      )}
    </section>
  );
}
