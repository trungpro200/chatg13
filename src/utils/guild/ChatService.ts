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
  async subscribeMessages(
    channelId: number,
    callback: (payload: Message) => void
  ) {
    await this.unsubscribe();

    const channel = supabase.channel(`messages:${channelId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => callback(payload.new as Message)
    );

    const status = await channel.subscribe();
    console.log("Subscription status:", status);

    // initial catch-up fetch to avoid missing anything that happened in the race window
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true }) // or false, depending on your UI needs
      .limit(50);

    if (!error && data) {
      // merge/apply these into UI/state as initial dataset
      data.forEach((msg) => callback(msg));
    } else if (error) {
      console.warn("Initial messages fetch failed:", error);
    }
  }

  async unsubscribe() {
    if (this.subscription) {
      // removeChannel returns a promise — await it to avoid races
      await supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }
}

export const chatService = new ChatService();
