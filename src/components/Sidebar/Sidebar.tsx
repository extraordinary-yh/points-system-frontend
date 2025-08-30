import React from "react";
import { AccountToggle } from "./AccountToggle";
import { Search } from "./Search";
import { RouteSelect } from "./RouteSelect";
import { useSidebar } from "@/contexts/SidebarContext";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="relative w-full h-full">
      {/* Sidebar Content */}
      <div className="bg-white border-r border-gray-200 h-full w-full">
        <div className="overflow-y-scroll h-full p-4">
          {isCollapsed ? (
            /* Collapsed State - Show Expand Button */
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                title="Expand sidebar"
              >
                <PanelLeft className="w-5 h-5 text-gray-600" />
              </button>
              <RouteSelect />
            </div>
          ) : (
            /* Expanded State - Show Full Content */
            <>
              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-6 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <AccountToggle />
              <Search />
              <RouteSelect />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
