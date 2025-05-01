// components/sidebar.tsx
'use client';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  user: { email?: string } | null;
}

export default function Sidebar({ isOpen, user }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#1E1E1E] text-white shadow transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-xl font-semibold">Chatbot</h2>
        <p className="text-sm text-neutral-400">
          Login to save and revisit previous chats!
        </p>
      </div>

      <div className="flex-1" />

      {user?.email && (
        <div className="absolute bottom-4 w-full px-4 text-sm text-neutral-400">
          Signed in as
          <span className="block font-medium text-white truncate">
            {user.email}
          </span>
        </div>
      )}
    </aside>
  );
}
