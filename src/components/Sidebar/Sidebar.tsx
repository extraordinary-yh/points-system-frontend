import React from "react";
import { AccountToggle } from "./AccountToggle";
import { Search } from "./Search";
import { RouteSelect } from "./RouteSelect";
import { useSidebar } from "@/contexts/SidebarContext";
import { PanelLeft } from "lucide-react";
import { FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="relative w-full h-full">
      {/* Sidebar Content */}
      <div className="bg-white border-r border-gray-200 h-full w-full rounded-lg">
        <div className="overflow-y-scroll h-full p-4 flex flex-col">
          {isCollapsed ? (
            /* Collapsed State - Show Expand Button */
            <div className="flex flex-col items-center h-full">
              {/* Top section - matches expanded mode spacing */}
              <div className="flex justify-center items-center mb-4 h-10 w-full">
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200"
                  title="Expand sidebar"
                >
                  <PanelLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1 w-full flex justify-center">
                <RouteSelect />
              </div>
              
              {/* Bottom section - matches expanded mode */}
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200"
                  title="Sign out"
                >
                  <FiLogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded State - Show Full Content */
            <>
              {/* Top row with search and toggle button */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1 mr-2">
                  <div className="h-10 flex items-center">
                    <Search />
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200"
                  title="Collapse sidebar"
                >
                  <PanelLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Main content area */}
              <div className="flex-1">
                <RouteSelect />
              </div>
              
              {/* Account info at bottom */}
              <div className="mt-2">
                <div className="border-t border-gray-200 pt-3">
                  <AccountToggle />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
