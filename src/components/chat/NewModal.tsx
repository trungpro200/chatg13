import React, { useRef } from "react";

type NewModalProps = {
  isOpen: boolean;
  mode: "create" | "join" | null;
  setIsOpen: (open: boolean) => void;
  setMode: (mode: "create" | "join" | null) => void;
  handleCreateGuild: (guildName: string) => void;
};

const NewModal: React.FC<NewModalProps> = ({
  isOpen,
  mode,
  setIsOpen,
  setMode,
  handleCreateGuild,
}) => {
  const guildNameRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        {/* Title and Close button inline */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {!mode
              ? "Add a Guild"
              : mode === "create"
              ? "Create a Guild"
              : "Join a Guild"}
          </h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setMode(null);
            }}
            className="text-gray-400 hover:text-white text-xl font-bold"
            aria-label="Close"
          >
            X
          </button>
        </div>
        {/* Modal content */}
        {!mode && (
          <>
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
            <input
              type="text"
              placeholder="Guild name"
              className="w-full p-2 rounded bg-gray-700 mb-4"
              ref={guildNameRef}
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
                  const name = guildNameRef.current?.value.trim() || "";
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
              <button className="px-4 py-2 bg-green-600 rounded">Join</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewModal;
