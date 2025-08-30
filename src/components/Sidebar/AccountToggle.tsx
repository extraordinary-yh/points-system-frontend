'use client';
import React from "react";
import { FiChevronDown, FiChevronUp, FiLogOut } from "react-icons/fi";
import { useSession, signOut } from "next-auth/react";
import { useSidebar } from "@/contexts/SidebarContext";

export const AccountToggle = () => {
  const { data: session } = useSession();
  const { isCollapsed } = useSidebar();

  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <div className="flex p-0.5 rounded transition-colors relative gap-2 w-full items-center">
        <img
          src="https://api.dicebear.com/9.x/notionists/svg"
          alt="avatar"
          className="size-8 rounded shrink-0 bg-violet-500 shadow"
        />
        {!isCollapsed && (
          <>
            <div className="text-start flex-1">
              <span className="text-sm font-bold block">{session?.user?.username || 'User'}</span>
              <span className="text-xs block text-stone-500">{session?.user?.email || 'user@propel2excel.com'}</span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1 hover:bg-stone-200 rounded transition-colors"
              title="Logout"
            >
              <FiLogOut className="text-sm text-stone-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
