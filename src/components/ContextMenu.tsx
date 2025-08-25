"use client";

import React, { useEffect, useRef } from "react";
import { Guild } from "@/app/chat/page";


type ContextMenuProps = {
  x: number;
  y: number;
  guild: Guild | null;
  onClose: () => void;
  onRename: (guild: Guild) => void;
  onLeave: (guild: Guild) => void;
};

export default function ContextMenu({
  x,
  y,
  guild,
  onClose,
  onRename,
  onLeave,
}: ContextMenuProps) {
    const menuRef = useRef<HTMLUListElement>(null);

// Đóng context menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  if (!guild) return null;

  return (
    <ul
      ref={menuRef}
      className="absolute bg-gray-800 text-white shadow-lg rounded-md py-2 z-50"
      style={{ top: y, left: x }}
    >
      <li
        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
        onClick={() => {onRename(guild); onClose();}}
      >
        Đổi tên nhóm
      </li>
      <li
        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
        onClick={() => {onLeave(guild); onClose();}}
      >
        Rời nhóm
      </li>
    </ul>
  );
}
