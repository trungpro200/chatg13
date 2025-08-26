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
        if (fullLink) {
        navigator.clipboard.writeText(fullLink);
        setCopied (true);
        setTimeout(() => setCopied(false), 2000);}
    };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 text-white border border-gray-700/60 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className = "text-white">Invite</DialogTitle>
        </DialogHeader>

        <div className = "bg-gray-700/80 text-white px-3 py-2 rounded-md font-mono tracking-wide truncate">
            {fullLink || "No invite available"}
        </div>

        <DialogFooter className="eflex justify-end gap-2">
          <Button onClick={handleCopy} variant={"secondary"} className = "border border-gray-600">
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
