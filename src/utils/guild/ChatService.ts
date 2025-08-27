import { supabase } from "@/lib/supabaseClient";

export type Message = {
  id: number;
  channel_id: number;
  user_id: string;
  content: string;
  created_at: string;
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
        user_id: session.user.id,
        content,
      })
      .select("*")
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
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) {
        console.error("fetchMessages error:", error);
        throw new Error(error.message);
    }
    return data as Message[];
  }
  // Subscribe realtime
  subscribeMessages(
    channelId: number,
    callback: (payload: Message) => void
  ) {
    this.subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  unsubscribe() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }
}

export const chatService = new ChatService();
