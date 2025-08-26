import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { UsageRadar } from "./UsageRadar";
import { RecentTransactions } from "./RecentTransactions";
import { DashboardErrorBoundary } from "./ErrorBoundary";

export const Grid = () => {
  return (
    <div className="px-4 grid gap-4 grid-cols-12">
      <DashboardErrorBoundary componentName="StatCards">
        <StatCards />
      </DashboardErrorBoundary>
      
      {/* Adjust layout: smaller point tracker (7 cols), bigger pie chart (5 cols) */}
      <DashboardErrorBoundary componentName="ActivityGraph">
        <ActivityGraph />
      </DashboardErrorBoundary>
      
      <DashboardErrorBoundary componentName="UsageRadar">
        <UsageRadar />
      </DashboardErrorBoundary>
      
      <DashboardErrorBoundary componentName="RecentTransactions">
        <RecentTransactions />
      </DashboardErrorBoundary>
    </div>
  );
};
