import React from "react";
import { useSession } from "next-auth/react";

export const TopBar = () => {
  const { data: session } = useSession();
  
  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border-b px-4 my-4 pb-4 border-stone-200">
      <div className="flex items-center justify-between p-0.5">
        <div>
          <span className="text-sm font-bold block">
            🚀 Welcome, {session?.user?.username || 'Student'}!
          </span>
          <span className="text-xs block text-stone-500">
            {formatDate()}
          </span>
        </div>
      </div>
    </div>
  );
};
