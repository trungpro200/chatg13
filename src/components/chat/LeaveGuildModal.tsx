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
  const [error, setError] = useState<string | null>(null);

  const handleLeave = async () => {
    if (!guildId || loading) return;

    setError(null);
    setLoading(true);

    const ok = await leaveGuild(guildId);

    setLoading(false);

    if (!ok) {
      setError("Bạn không thể rời guild này (có thể bạn là trưởng nhóm).");
      return;
    }

    onLeaveSuccess?.(guildId);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={!loading ? onClose : undefined} //khóa đóng khi loading
    >
      <DialogContent
        className="bg-gray-800 text-white"
        onPointerDownOutside={(e) => loading && e.preventDefault()} // chặn click ngoài
        onEscapeKeyDown={(e) => loading && e.preventDefault()}      // chặn ESC
      >
        <DialogHeader>
          <DialogTitle>Xác nhận rời nhóm</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-300">
          Bạn có chắc chắn muốn rời nhóm này? Hành động này không thể hoàn tác.
        </p>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-400 mt-2">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleLeave}
            disabled={loading}
          >
            {loading ? "Đang rời..." : "Rời nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveGuildModal;
