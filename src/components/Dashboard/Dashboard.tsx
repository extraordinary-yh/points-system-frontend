import React from "react";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";

export const Dashboard = () => {
  return (
    <>
      <TopBar />
      <div className="content-fade-in-scale">
        <Grid />
      </div>
    </>
  );
};
