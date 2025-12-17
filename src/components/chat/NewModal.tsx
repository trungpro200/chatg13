import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinGuild } from "@/utils/guild/invite";
import { useRouter } from "next/navigation";

type NewModalProps = {
  isOpen: boolean;
  mode: "create" | "join" | null;
  setIsOpen: (open: boolean) => void;
  setMode: (mode: "create" | "join" | null) => void;
  handleCreateGuild: (guildName: string) => void;
  isCreating: boolean;
};

const NewModal: React.FC<NewModalProps> = ({
  isOpen,
  mode,
  setIsOpen,
  setMode,
  handleCreateGuild,
  isCreating,
}) => {
  const guildNameRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const router = useRouter();

  async function onCreate() {
    if (creating) return;

    setCreating(true);
    const name = guildNameRef.current?.value.trim() || "";
    if (name) await handleCreateGuild(name);
    setCreating(false);
  }

  async function onJoin() {
    const inviteCode = (
      document.getElementById("invite-code-input") as HTMLInputElement
    )?.value?.trim();

    if (!inviteCode) return;

    try {
      await joinGuild(inviteCode);

      // đóng modal
      setIsOpen(false);
      setMode(null);

      // reload guild list 
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Invite code không hợp lệ hoặc đã tham gia guild này");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>
            {!mode
              ? "Add a Guild"
              : mode === "create"
              ? "Create a Guild"
              : "Join a Guild"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {!mode && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setMode("create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create a Guild
            </Button>
            <Button
              onClick={() => setMode("join")}
              className="bg-green-600 hover:bg-green-700"
            >
              Join with Invite Code
            </Button>
          </div>
        )}

        {/* Create Guild */}
        {mode === "create" && (
          <>
            <Input
              type="text"
              placeholder="Guild name"
              ref={guildNameRef}
              className="bg-gray-700 text-white"
            />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setMode(null)}>
                Back
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={creating}
                onClick={onCreate}
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Join Guild */}
        {mode === "join" && (
          <>
            <Input
              id="invite-code-input"
              type="text"
              placeholder="Invitation Code"
              className="bg-gray-700 text-white"
            />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setMode(null)}>
                Back
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={onJoin}
              >
                Join
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewModal;
