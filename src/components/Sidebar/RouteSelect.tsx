import React, { useState } from "react";
import { IconType } from "react-icons";
import { 
  FiHome, 
  FiTarget, 
  FiGift, 
  FiClock, 
  FiUser,
  FiBarChart
} from "react-icons/fi";

export const RouteSelect = () => {
  const [selectedRoute, setSelectedRoute] = useState("Dashboard");

  const routes = [
    { icon: FiHome, title: "Dashboard" },
    { icon: FiTarget, title: "Activities" },
    { icon: FiGift, title: "Rewards" },
    { icon: FiClock, title: "History" },
    { icon: FiBarChart, title: "Analytics" },
    { icon: FiUser, title: "Profile" }
  ];

  return (
    <div className="space-y-1">
      {routes.map((route) => (
        <Route 
          key={route.title}
          Icon={route.icon} 
          selected={selectedRoute === route.title} 
          title={route.title}
          onClick={() => setSelectedRoute(route.title)}
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
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color] ${
        selected
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
      }`}
    >
      <Icon className={selected ? "text-violet-500" : ""} />
      <span>{title}</span>
    </button>
  );
};
