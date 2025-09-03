"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import { Guild } from "@/utils/guild/types";

type ContextMenuProps = {
  x: number;
  y: number;
  guild: Guild | null;
  onClicks: (() => void)[];
  labels: (string | ReactNode) [];
  onClose: () => void;
  maxWidth?: string;
};

type ContextMenuButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

function ContextMenuButton({ onClick, children }: ContextMenuButtonProps) {
  return (
    <li
      className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
      onClick={onClick}
    >
      {children}
    </li>
  );
}

export default function ContextMenu({
  x,
  y,
  guild,
  onClose,
  labels,
  onClicks,
  maxWidth = "auto"
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
  
  if (!guild && labels.length === 0) return null;

  return (
    <ul
      ref={menuRef}
      className="absolute bg-gray-800 text-white shadow-lg rounded-md py-2 z-50"
      style={{ top: y, left: x, maxWidth }}
    >
      {labels.map((label, index) => (
        <ContextMenuButton key={index} onClick={onClicks[index]}>
          {label}
        </ContextMenuButton>
      ))}
    </ul>
  );
}
