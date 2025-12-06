import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "" }: Props) {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 text-sm text-white px-3 py-2 pl-9 rounded-md outline-none border border-gray-700 focus:border-blue-500"
      />

      {/* Icon search */}
      <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <FaTimes size={12} />
        </button>
      )}
    </div>
  );
}
