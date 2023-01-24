import React from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";


const DashboardLayout = () => {
  const isDesktop = useResponsive("up", "md");
  
  const isAuthenticated = true;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <>
      <Stack direction="row">
        {isDesktop && (
          <SideNav />
        )}
        <Outlet />
      </Stack>
    </>
  );
};

export default DashboardLayout;
