"use client";

import React, { useState } from "react";
import { FiCommand, FiSearch } from "react-icons/fi";
import { CommandMenu } from "./CommandMenu";

export const Search = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-stone-50 relative rounded-lg flex items-center px-3 py-2 text-sm border border-stone-200 h-full hover:border-stone-300 transition-colors duration-200">
        <FiSearch className="mr-2 text-stone-400" />
        <input
          onFocus={(e) => {
            e.target.blur();
            setOpen(true);
          }}
          type="text"
          placeholder="Search"
          className="w-full bg-transparent placeholder:text-stone-400 placeholder:font-normal placeholder:tracking-wide focus:outline-none text-sm font-medium"
        />

        <span className="px-2 py-1 text-xs flex gap-1 items-center shadow-sm bg-stone-100 rounded-md absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 font-medium">
          <FiCommand className="w-3 h-3" />K
        </span>
      </div>

      <CommandMenu open={open} setOpen={setOpen} />
    </>
  );
};
