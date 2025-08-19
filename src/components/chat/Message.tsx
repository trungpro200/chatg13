import React from "react";

type Props = {
  selectedChannel: string | null;
};

export default function Message({ selectedChannel }: Props) {
  return (
    <section className="flex-1 flex flex-col">
      <header className="h-12 bg-gray-800 px-4 flex items-center border-b border-gray-700">
        <h3 className="font-semibold">
          {selectedChannel ? `# ${selectedChannel}` : "Select a channel"}
        </h3>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="bg-gray-800 p-2 rounded">Hello World!</div>
        <div className="bg-gray-800 p-2 rounded">Another message...</div>
      </div>
      <footer className="p-4 border-t border-gray-700">
        <input
          type="text"
          placeholder="Message..."
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        />
      </footer>
    </section>
  );
}
