import { supabase } from "@/lib/supabaseClient";

export type Message = {
  id: number | string;
  channel_id: number;
  author_id: string;
  content: string;
  created_at: string;
  pinned?: boolean;
  profiles?: { email: string | null };
};

class ChatService {
  private subscription: ReturnType<typeof supabase.channel> | null = null;

  // Gửi tin nhắn
  async sendMessage(channelId: number, content: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        content,
        author_id: session.user.id,
      })
      .select("*, profiles(email)")
      .single();

    if (error) {
      console.error("sendMessage error:", error);
      throw new Error(error.message);
    }
    return data as Message;
  }

  // hiện tin nhắn cũ
  async fetchMessages(channelId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(email)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("fetchMessages error:", error);
      throw new Error(error.message);
    }
    console.log("fetchMessages success:", data);
    return data as Message[];
  }

  // Pinned
  async togglePinned(messageId: number, pinned: boolean) {
    const { data, error } = await supabase
      .from("messages")
      .update({ pinned })
      .eq("id", messageId)
      .select("*, profiles(email)")
      .single();

    if (error) {
      console.error("togglePinned error:", error);
      throw new Error(error.message);
    }
    return data as Message;
  }

  // Subscribe realtime
  subscribeMessages(channelId: number, callback: (payload: Message) => void) {
    this.unsubscribe(); // Hủy đăng ký trước nếu đã có
    this.subscription = supabase
      .channel(`messages-channel-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log("🔔 Realtime payload:", payload);
          callback(payload.new as Message);
        }
      )
      .subscribe((status) => {
        console.log("📡 Subscription status:", status);
      });

      console.log("Subscribed to messages channel:", `messages-channel-${channelId}`);
  }

  unsubscribe() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }
}

export const chatService = new ChatService();
