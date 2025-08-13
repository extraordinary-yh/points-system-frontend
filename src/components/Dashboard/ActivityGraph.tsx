"use client";

import React from "react";
import { FiUser } from "react-icons/fi";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";

const data = [
  {
    name: "Jan",
    
    Points: 41,
  },
  {
    name: "Feb",
    
    Points: 96,
  },
  {
    name: "Mar",
    
    Points: 192,
  },
  {
    name: "Apr",
    
    Points: 50,
  },
  {
    name: "May",
    
    Points: 400,
  },
  {
    name: "Jun",
    
    Points: 200,
  },
  {
    name: "Jul",
    
    Points: 205,
  },
];

export const ActivityGraph = () => {
  return (
    <div className="col-span-8 overflow-hidden rounded border border-stone-300">
      <div className="p-4">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiUser /> Point Tracker
        </h3>
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: -24,
              bottom: 0,
            }}
          >
            <CartesianGrid stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs font-bold"
              padding={{ right: 4 }}
            />
            <YAxis
              className="text-xs font-bold"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
            />
            <Line
              type="monotone"
              dataKey="Points"
              stroke="#5b21b6"
              fill="#5b21b6"
            />
         
            
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
