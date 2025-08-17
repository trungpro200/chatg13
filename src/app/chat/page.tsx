"use client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image"; 

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else setLoading(false);
    });
  }, [router]);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <main className="flex h-screen bg-gray-900 text-white">
      {/* Server Sidebar */}
      <aside className="w-20 bg-gray-800 flex flex-col items-center py-4 space-y-4 border-r border-gray-700">
        {/* Example placeholder server icons */}
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
          L
        </div>
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 cursor-pointer">
          +
        </div>
      </aside>

      {/* Channel Sidebar */}
      <aside className="w-60 bg-gray-850 p-4 flex flex-col border-r border-gray-700">
        <h2 className="font-bold mb-4">Server Name</h2>
        <nav className="flex-1 space-y-2">
          <p className="text-gray-400 text-xs uppercase">Text Channels</p>
          <div className="cursor-pointer p-1 rounded hover:bg-gray-700">
            # general
          </div>
          <div className="cursor-pointer p-1 rounded hover:bg-gray-700">
            # random
          </div>
        </nav>
        <div className="pt-4 border-t border-gray-700 text-sm">
          <p>User Name</p>
        </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">
        {/* Chat header */}
        <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <h3 className="font-bold"># general</h3>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty for now - will implement later */}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Message #general"
            className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>
    </main>
  );
}
