import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type InviteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string | null;
};
const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  inviteCode,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const fullLink = inviteCode ? `${window.location.origin}/join/${inviteCode}` : "";

  const handleCopy = async () => {
    if (!fullLink) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullLink);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullLink;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full bg-gray-800 text-white border border-gray-700/60 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Invite</DialogTitle>
        </DialogHeader>

        {/* Layout link input */}
        <Input
          readOnly
          value={fullLink || "No invite available"}
          className="bg-gray-700/80 text-white font-mono tracking-wide"
        />

        <DialogFooter className="flex justify-end gap-2">
          <Button onClick={handleCopy} variant={"secondary"} className="border border-gray-600">
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={onClose} variant={"secondary"} className="border border-gray-600">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default InviteModal;
