"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const router = useRouter();

  const rpcDebug = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    const frontendUserId = session?.user?.id ?? null;

    // Pass frontendUserId to RPC
    const { data: debug, error } = await supabase.rpc("debug_auth_context", {
      frontend_user_id: frontendUserId,
    });

    console.log("Debug RPC:", debug, "Error:", error);
    console.log("current session:", await supabase.auth.getSession());
  };

  const handleCreateGuild = async (guildName: string) => {
    rpcDebug();
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

  return (
    <main className="flex h-screen bg-gray-900 text-white">
      {/* Guild Sidebar */}
      <aside className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
        <button
          className="w-12 h-12 bg-gray-700 rounded-full hover:bg-gray-600"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
        {/* Example guild */}
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
          G
        </div>
      </aside>

      {/* Channel Sidebar */}
      <aside className="w-60 bg-gray-850 p-4 flex flex-col">
        <h2 className="font-bold mb-4">Guild Name</h2>
        <nav className="space-y-2">
          <button
            className="block w-full text-left px-2 py-1 rounded hover:bg-gray-700"
            onClick={() => setSelectedChannel("general")}
          >
            # general
          </button>
          <button
            className="block w-full text-left px-2 py-1 rounded hover:bg-gray-700"
            onClick={() => setSelectedChannel("random")}
          >
            # random
          </button>
        </nav>
      </aside>

      {/* Chat Window */}
      <section className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="h-12 bg-gray-800 px-4 flex items-center border-b border-gray-700">
          <h3 className="font-semibold">
            {selectedChannel ? `# ${selectedChannel}` : "Select a channel"}
          </h3>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="bg-gray-800 p-2 rounded">Hello World!</div>
          <div className="bg-gray-800 p-2 rounded">Another message...</div>
        </div>

        {/* Message Input */}
        <footer className="p-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Message..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />
        </footer>
      </section>

      {/* New guild Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setMode(null);
                }}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                X
              </button>
            </div>
            {!mode && (
              <>
                <h2 className="text-lg font-bold mb-4">Add a Guild</h2>
                <button
                  onClick={() => setMode("create")}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded mb-2"
                >
                  Create a Guild
                </button>
                <button
                  onClick={() => setMode("join")}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded"
                >
                  Join with Invite Code
                </button>
              </>
            )}

            {mode === "create" && (
              <>
                <h2 className="text-lg font-bold mb-4">Create a Guild</h2>
                <input
                  type="text"
                  placeholder="Guild name"
                  className="w-full p-2 rounded bg-gray-700 mb-4"
                  id="guild-name-input"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-600 rounded"
                    onClick={() => setMode(null)}
                  >
                    Back
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
                    onClick={() => {
                      const name = (
                        document.querySelector<HTMLInputElement>(
                          "#guild-name-input"
                        )?.value || ""
                      ).trim();
                      console.log("Creating guild with name:", name);
                      if (name) handleCreateGuild(name);
                    }}
                  >
                    Create
                  </button>
                </div>
              </>
            )}

            {mode === "join" && (
              <>
                <h2 className="text-lg font-bold mb-4">Join a Guild</h2>
                <input
                  type="text"
                  placeholder="Invitation Code"
                  className="w-full p-2 rounded bg-gray-700 mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-600 rounded"
                    onClick={() => setMode(null)}
                  >
                    Back
                  </button>
                  <button className="px-4 py-2 bg-green-600 rounded">
                    Join
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
