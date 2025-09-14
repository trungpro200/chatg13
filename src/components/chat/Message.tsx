import React, { useEffect, useState, useRef } from "react";
import { chatService, Message as MessageType } from "@/utils/guild/ChatService";
import { Guild } from "@/utils/guild/types";
import { supabase } from "@/lib/supabaseClient";
import ContextMenu from "../ContextMenu";
import { FaThumbtack } from "react-icons/fa6";

type Props = {
  selectedChannel: string | null;
  selectedGuild: Guild | null;
  setSelectedChannel: (channel: string) => void;
  showMembers: boolean;
  setShowMembers: (v: boolean) => void;
};

export default function Message({ selectedChannel, selectedGuild, setSelectedChannel, showMembers, setShowMembers }: Props) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [channelId, setChannelId] = useState<number | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [pendingMessages, setPendingMessages] = useState<MessageType[]>([]);
  const [pinnedMsg, setPinnedMsg] = useState<MessageType[]>([]);
  const [pinLoading, setPinLoading] = useState<string | number | null>(null);

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
  }>({ x: 0, y: 0, visible: false });

  useEffect(() => {
    //Dynamic update on selectedGuild changes
    setMessages([]);
    setChannelId(null);
    setPinnedMsg([]);
    setSelectedChannel("Select a channel");
    console.log("Guild changed?");
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

    let cancelled = false;
    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    // Fetch initial messages before subscribing
    (async () => {
      try {
        const initialMessages = await chatService.fetchMessages(channelId);
        if (cancelled) return;
        setMessages(initialMessages);
        setPinnedMsg(initialMessages.filter((msg) => msg.pinned));
        initialMessages.forEach((msg) => fetchUserProfile(msg.author_id));
        scrollToBottom();

        // Now subscribe to realtime updates (await to ensure subscription is active)
        channelRef = await chatService.subscribeMessages(channelId, (msg) => {
          if (cancelled) return;
          // Only handle new/changed messages
          setMessages((prev) => {
            // prevent duplicates; if exists replace (update), otherwise append
            if (prev.some((m) => m.id === msg.id))
              return prev.map((m) => (m.id === msg.id ? msg : m));
            return [...prev, msg];
          });

          setPinnedMsg((prev = []) => {
            if (msg.pinned) {
              if (prev.some((m) => m.id === msg.id))
                return prev.map((m) => (m.id === msg.id ? msg : m));
              return [...prev, msg];
            }
            return prev.filter((m) => m.id !== msg.id);
          });

          fetchUserProfile(msg.author_id);
          scrollToBottom();
        });
      } catch (err) {
        console.warn("subscribe setup failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (channelRef) {
        supabase
          .removeChannel(channelRef)
          .catch((e) => console.warn("failed to remove channel on cleanup", e));
      }
    };
  }, [channelId]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !channelId) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: MessageType = {
      id: tempId,
      content: input,
      author_id: "me", // TODO: thay bằng user id thực tế
      channel_id: channelId,
      pinned: false,
      created_at: new Date().toISOString(),
    }

    setPendingMessages((prev) => [...prev, newMsg]);
    // clear input + reset textarea
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
    scrollToBottom();
    try {
      await chatService.sendMessage(channelId, input);
      setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
    catch (err) {
       console.error("Send failed", err); // Hiển thị lỗi khi tin nhắn không gửi được
    }
  };

  useEffect(() => {
    if (pendingMessages.length > 0) {
      scrollToBottom();
    }
  }, [pendingMessages]);

  const handleMenuClick = async (label: string, msg: MessageType) => {
    if (label === "Pin" || label === "Unpin") {
      setPinLoading(msg.id);
      try {
          const updated = await chatService.togglePinned(Number(msg.id), !msg.pinned);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? updated : m))
        );
        setPinnedMsg((prev) =>
          updated.pinned ? [...(prev ?? []), updated] : (prev ?? []).filter((m) => m.id !== msg.id)
        );
      }
      finally {
        setPinLoading(null);
      }
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);


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
      <header className="h-12 bg-gray-800 px-4 flex items-center justify-between border-b border-gray-700">
        <h3 className="font-semibold">
          {selectedChannel ? `# ${selectedChannel}` : "Select a channel"}
        </h3>

        <button
          onClick={() => setShowMembers(!showMembers)}
          className="p-2 rounded hover:bg-gray-700"
          title={showMembers ? "Hide Members" : "Show Members"}
        >
          {showMembers ? (
            <img src="https://img.icons8.com/?size=100&id=4r3xdsxcmOTJ&format=png&color=000000" alt="Hide Members" className="w-7 h-7" />
          ) : (
            <img src="https://img.icons8.com/?size=100&id=YzsadpdsoN8e&format=png&color=000000" alt="Show Members" className="w-7 h-7" />
          )}
        </button>
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
          <span>{pinnedMsg.length} pinned messages</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {[...messages, ...pendingMessages].map((msg) => (
            <div
              key={msg.id}
              ref={(el) => {
                (msgRefs.current[msg.id] = el)}
              }
              className="flex w-full justify-start"
            >
              <div
                className={`relative p-3 rounded-md shadow-lg inline-block break-all whitespace-pre-wrap max-w-[70%] ${
                  msg.pinned ? "bg-yellow-800" : msg.id.toString().startsWith("temp-") ? "bg-gray-700 opacity-70" : "bg-gray-800"
                }`}
                onContextMenu={(e) => {
                setMenu({ x: e.clientX, y: e.clientY, message: msg });
              }}
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
                    </div>
                    <p className="text-gray-200 text-sm">{msg.content}</p>

                    {msg.id.toString().startsWith("temp-") && (
                      <span className="text-xs text-gray-400 italic">Tin nhắn đang gửi...</span>
                    )}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) { // Xuống dòng
                    e.preventDefault();
                    
                    if (textareaRef.current) {
                        const { selectionStart, selectionEnd } = e.currentTarget;
                      const newValue = input.substring(0, selectionStart) + "\n" + input.substring(selectionEnd);
                      setInput(newValue);

                      // di chuyển con trỏ đúng chỗ
                      requestAnimationFrame(() => {
                        if (textareaRef.current)
                          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1;
                      });
                    }
                  }
                  else {
                    // Gửi tin nhắn
                    handleSend(e as unknown as React.FormEvent);
                  }
                }
              }}  
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
            <span key="pin" className={`flex items-center ${pinLoading === menu.message.id ? "opacity-50 cursor-not-allowed" : ""}`}>
              <FaThumbtack className="inline mr-2" />
              {menu.message.pinned ? "Unpin" : "Pin"}
            </span>
          ]}
          onClicks={[
            pinLoading === menu.message?.id
              ? () => {} // không làm gì khi đang loading
              : () => handleMenuClick(menu.message!.pinned ? "Unpin" : "Pin", menu.message!)
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
              <strong>{usernames[m.author_id] || m.author_id}</strong>:{" "}
              {m.content}
            </span>
          ))}
          onClose={() => setPinMenu({ ...pinMenu, visible: false })}
          onClicks={pinnedMsg.map((m) => () => scrollToMessage(m.id))}
          maxWidth="300px"
        />
      )}
    </section>
  );
}
