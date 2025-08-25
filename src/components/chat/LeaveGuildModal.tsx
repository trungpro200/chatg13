import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { leaveGuild } from "@/utils/guild/manager";

type LeaveGuildModalProps = {
  isOpen: boolean;
  guildId: number | null;
  onClose: () => void;
  onLeaveSuccess?: (guildId: number) => void;
};

const LeaveGuildModal: React.FC<LeaveGuildModalProps> = ({
  isOpen,
  guildId,
  onClose,
  onLeaveSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    if (!guildId) return;

    setLoading(true);
    const ok = await leaveGuild(guildId);
    setLoading(false);

    if (!ok) {
      alert("Không thể rời nhóm! Vì bạn là trưởng nhóm!");
      return;
    }

    onLeaveSuccess?.(guildId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Xác nhận rời nhóm</DialogTitle>
        </DialogHeader>
        <p>
          Bạn có chắc chắn muốn rời nhóm này? Hành động này không thể hoàn tác.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleLeave}
            disabled={loading}
          >
            Rời nhóm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveGuildModal;
