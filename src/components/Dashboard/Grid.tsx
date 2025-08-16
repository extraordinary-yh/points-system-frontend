import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { UsageRadar } from "./UsageRadar";
import { RecentTransactions } from "./RecentTransactions";
import { DiscordCard } from "./DiscordCard";

export const Grid = () => {
  return (
    <div className="px-4 grid gap-3 grid-cols-12">
      <StatCards />
      <DiscordCard />
      <ActivityGraph />
      <UsageRadar />
      <RecentTransactions />
    </div>
  );
};
