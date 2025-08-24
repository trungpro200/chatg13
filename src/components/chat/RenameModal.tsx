import React, { useRef, useEffect } from "react";
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
import { Guild } from "@/app/chat/page";
type RenameModalProps = {
  isOpen: boolean;
  guild: Guild | null;
  onClose: () => void;
  onRename: (guildId: string, newName: string) => void;
};

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  guild,
  onClose,
  onRename,
}) => {
  const nameRef = useRef<HTMLInputElement>(null);

  // Khi mở modal, tự động focus vào ô input
  useEffect(() => {
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
      if (guild?.name) {
        nameRef.current.value = guild.name;
      }
    }
  }, [isOpen, guild]);

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
        />

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              const newName = nameRef.current?.value.trim();
              if (guild && newName) {
                onRename(guild.id, newName);
                onClose();
              }
            }}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;