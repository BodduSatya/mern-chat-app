import React from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";
import { useSelector } from "react-redux";


const DashboardLayout = () => {

  const { isLoggedIn } = useSelector((state) => state.auth);
  const isDesktop = useResponsive("up", "md");

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
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
