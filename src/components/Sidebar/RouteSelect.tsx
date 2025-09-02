import React, { useState, useEffect } from "react";
import { IconType } from "react-icons";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { 
  FiHome, 
  FiGift, 
  FiUser,
  FiAward
} from "react-icons/fi";

export const RouteSelect = () => {
  const [selectedRoute, setSelectedRoute] = useState("Dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const routes = [
    { icon: FiHome, title: "Dashboard", href: "/dashboard" },
    { icon: FiGift, title: "Rewards", href: "/rewards" },
    { icon: FiAward, title: "Leaderboard", href: "/leaderboard" },
    { icon: FiUser, title: "Profile", href: "/profile" }
  ];

  // Update selected route based on current pathname
  useEffect(() => {
    const currentRoute = routes.find(route => route.href === pathname);
    if (currentRoute) {
      setSelectedRoute(currentRoute.title);
    }
  }, [pathname]);

  const handleRouteClick = (route: typeof routes[0]) => {
    setSelectedRoute(route.title);
    router.push(route.href);
  };

  return (
    <div className={`space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
      {routes.map((route) => (
        <Route 
          key={route.title}
          Icon={route.icon} 
          selected={selectedRoute === route.title} 
          title={route.title}
          onClick={() => handleRouteClick(route)}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
};

const Route = ({
  selected,
  Icon,
  title,
  onClick,
  isCollapsed,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  onClick: () => void;
  isCollapsed: boolean;
}) => {
  return (
    <button
      onClick={onClick}
              className={`flex items-center gap-3 rounded-lg transition-[box-shadow,_background-color,_color] ${
          isCollapsed 
            ? "w-10 h-10 justify-center" 
            : "w-full h-10 px-3 justify-start"
        } ${
        selected
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-gray-50 text-stone-500 shadow-none"
      }`}
    >
      <Icon className={`${selected ? "text-violet-500" : ""} w-5 h-5`} />
      {!isCollapsed && <span className="text-sm text-left">{title}</span>}
    </button>
  );
};