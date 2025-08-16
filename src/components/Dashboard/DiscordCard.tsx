'use client';
import React from "react";
import { useSession } from "next-auth/react";
import { DiscordLink } from "../DiscordLink";

export const DiscordCard = () => {
  const { data: session } = useSession();

  return (
    <div className="col-span-12 lg:col-span-6">
      <DiscordLink 
        initialLinked={!!session?.user?.discord_id}
        initialDiscordId={session?.user?.discord_id}
        onLinkComplete={() => {
          // Optionally refresh user data or show notification
          window.location.reload();
        }}
      />
    </div>
  );
};
