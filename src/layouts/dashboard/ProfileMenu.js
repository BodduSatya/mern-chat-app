import React from "react";
import { Avatar, Box, Fade, Menu, MenuItem, Stack } from "@mui/material";
import { faker } from "@faker-js/faker";
import { Profile_Menu } from "../../data";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event) => {
    setAnchorEl(null);
  };

  const getMenuPath = (index) => {
    switch (index) {
      case 0:
        return "/profile";

      case 1:
        return "/settings";

      case 2:
        // to update token & set isAuth = false
        return "/auth/login";

      default:
        break;
    }
  };

  return (
    <>
      <Avatar
        id="profile-positioned-button"
        aria-controls={openMenu ? "profile-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openMenu ? "true" : undefined}
        alt={faker.name.fullName()}
        src={faker.image.avatar()}
        onClick={handleClick}
      />
      <Menu
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        TransitionComponent={Fade}
        id="profile-positioned-menu"
        aria-labelledby="profile-positioned-button"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={1}>
          <Stack spacing={1}>
            {Profile_Menu.map((el, idx) => (
              <MenuItem
                onClick={() => {
                  handleClick()
                }}
              >
                <Stack
                  onClick={() => {
                    navigate(getMenuPath(idx))
                  }}
                  sx={{ width: 100 }}
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                >
                  <span>{el.title}</span>
                  {el.icon}
                </Stack>{" "}
              </MenuItem>
            ))}
          </Stack>
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
