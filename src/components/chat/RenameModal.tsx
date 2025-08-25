import React, { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameGuild } from "@/utils/guild/manager";
type RenameModalProps = {
  isOpen: boolean;
  guildId: number | null;
  initialName?: string;
  onClose: () => void;
  onRenameSuccess?: (guildId: number, newName: string) => void;
};

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  guildId,
  initialName,
  onClose,
  onRenameSuccess,
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Khi mở modal, tự động focus vào ô input
  useEffect(() => {
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
      if (initialName) {
        nameRef.current.value = initialName || "";
      }
    }
  }, [isOpen, initialName]);

  const handleSave = async () => {
    const newName = nameRef.current?.value.trim();
    if (!guildId || !newName) return;

    setLoading(true);
    const updatedGuild = await renameGuild(guildId, newName);
    setLoading(false);

    if (!updatedGuild) {
      alert("Đổi tên thất bại!");
      return;
    }

    // gọi callback để update local state
    onRenameSuccess?.(guildId, updatedGuild.name);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Đổi tên nhóm</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Nhập tên mới"
          ref={nameRef}
          className="bg-gray-700 text-white"
          disabled={loading}
        />

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={loading}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;