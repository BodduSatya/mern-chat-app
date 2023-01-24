import {
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  Link,
} from "@mui/material";
import { MagnifyingGlass, Phone } from "phosphor-react";
import React, { useState } from "react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";

import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { CallLogElement } from "../../components/CallElement";
import { CallList } from "../../data";
import StartCall from "../../sections/dashboard/StartCall";
import { Scrollbars } from 'react-custom-scrollbars';
import useResponsive from "../../hooks/useResponsive";

const Call = () => {
  const isDesktop = useResponsive("up", "md");
  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  }
  const handleOpenDialog = () => {
    setOpenDialog(true);
  }
  const theme = useTheme();
  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        {/* Left */}
        <Box
          sx={{
            position: "relative",
            height: "100%",
            width: isDesktop ? 320 : "100vw",
            backgroundColor: theme.palette.mode === "light" ? "#F8FAFF" : theme.palette.background,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={1} spacing={0.5} sx={{ maxHeight: "100vh" }}>
            <Stack
              alignItems={"center"}
              justifyContent="space-between"
              direction="row"
            >
              <Typography variant="h5">Call Log</Typography>
            </Stack>

            <Stack sx={{ width: "100%" }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color="#709CE6" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </Stack>

            <Stack
              justifyContent={"space-between"}
              alignItems={"center"}
              direction={"row"}
            >
              <Typography variant="subtitle2" sx={{}} component={Link}>
                Start a conversation
              </Typography>
              <IconButton onClick={handleOpenDialog}>
                <Phone style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>
            <Divider />
            <Stack sx={{ flexGrow: 1, height: "100%" }}>
              {/* <SimpleBarStyle timeout={500} clickOnTrack={false}> */}
              <Scrollbars autoHide autoHideTimeout={1000} style={{ height: '77vh' }}>
                <Stack spacing={0.4}>
                  {CallList.map((el, idx) => {
                    return <CallLogElement key={idx} {...el} />;
                  })}
                </Stack>
              </Scrollbars>
              {/* </SimpleBarStyle> */}
            </Stack>
          </Stack>
        </Box>
      </Stack>
      {openDialog && <StartCall open={openDialog} handleClose={handleCloseDialog} />}
    </>
  );
};

export default Call;
