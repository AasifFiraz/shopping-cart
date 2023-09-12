import { useContext, useEffect, useState } from "react";

import {
  User,
  useAddUserMutation,
  useLazyGetUserQuery,
} from "../../api/userApiSlice";
import { TextField, Tabs, Tab, Box, Button } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import UserContext from "../../contexts/UserContext";
import { useCreateUserCartMutation } from "../../api/productsApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { setLastLogin } from "./userSlice";

const Login = () => {
  const { login } = useContext(UserContext);
  const [value, setValue] = useState("login");
  const dispatch = useDispatch();
  const [triggerCreateUserCartMutation] = useCreateUserCartMutation();
  const savedCart = useSelector(
    (state: RootState) => state.carts.savedCarts && state.carts.savedCarts[0]
  );
  const [loginUser, setLoginUser] = useState<User>({
    username: "",
    password: "",
  });
  const [registerUser, setRegisterUser] = useState<User>({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [triggerCreateUserMutation, { isError }] = useAddUserMutation();
  const [triggerGetUserQuery, { data: user, isSuccess }] =
    useLazyGetUserQuery();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (user && isSuccess) {
      login(user);
      dispatch(setLastLogin(new Date().toISOString()));
    }
  }, [isSuccess, user]);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await triggerGetUserQuery({ ...loginUser });
    setLoginUser({ username: "", password: "" });
  };

  const handleRegisterSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const registerUserData = {...registerUser, id: nanoid()}
    await triggerCreateUserMutation(registerUserData);
    if (!isError) {
      login(registerUserData);
      if (savedCart && !savedCart.userId) {
        const updatedCart = {
          ...savedCart,
          userId: registerUserData.id,
        };
        triggerCreateUserCartMutation(updatedCart);
      }
    }
    setRegisterUser({ id: "", username: "", password: "", email: "", mobile: "" });
  };

  const allValuesExist = (obj: Partial<User>) =>
    Object.values(obj).every(Boolean);
  const isLoginBtnDisabled = allValuesExist(loginUser);
  const isRegisterBtnDisabled = allValuesExist(registerUser);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid black",
          width: "400px",
          marginTop: "40px",
        }}
      >
        <Box sx={{ width: "100%", borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            centered
            textColor="inherit"
            sx={{
              ".Mui-selected": {
                backgroundColor: "#1B8DD7",
                color: "black",
              },
              "& .MuiTab-root": {
                flex: 1,
              },
            }}
          >
            <Tab value="login" label="Login" />
            <Tab value="register" label="Register" />
          </Tabs>
        </Box>

        <TabContext value={value}>
          <TabPanel value="login">
            <div
              style={{
                gap: "10px",
              }}
            >
              <Box
                component="form"
                onSubmit={handleLoginSubmit}
                noValidate
                sx={{
                  mt: 1,
                  "& .MuiTextField-root": { m: 1, width: "30ch" },
                }}
              >
                <TextField
                  margin="normal"
                  required
                  id="username"
                  value={loginUser.username}
                  label="Username"
                  name="username"
                  onChange={(e) =>
                    setLoginUser({ ...loginUser, username: e.target.value })
                  }
                  autoComplete="username"
                />
                <TextField
                  margin="normal"
                  required
                  name="password"
                  value={loginUser.password}
                  label="Password"
                  type="password"
                  id="password"
                  onChange={(e) =>
                    setLoginUser({ ...loginUser, password: e.target.value })
                  }
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isLoginBtnDisabled}
                  sx={{ mt: 3, mb: 2, width: "30ch" }}
                >
                  Login
                </Button>
              </Box>
            </div>
          </TabPanel>
          <TabPanel value="register">
            <div
              style={{
                gap: "10px",
              }}
            >
              <Box
                component="form"
                onSubmit={handleRegisterSubmit}
                noValidate
                sx={{
                  mt: 1,
                  "& .MuiTextField-root": { m: 1, width: "30ch" },
                }}
              >
                <TextField
                  margin="normal"
                  required
                  id="username"
                  value={registerUser.username}
                  label="Username"
                  name="username"
                  onChange={(e) =>
                    setRegisterUser({
                      ...registerUser,
                      username: e.target.value,
                    })
                  }
                  autoComplete="username"
                />
                <TextField
                  margin="normal"
                  required
                  id="email"
                  value={registerUser.email}
                  label="Email"
                  name="email"
                  onChange={(e) =>
                    setRegisterUser({ ...registerUser, email: e.target.value })
                  }
                  autoComplete="email"
                />
                <TextField
                  margin="normal"
                  required
                  id="mobile"
                  value={registerUser.mobile}
                  label="Mobile"
                  name="mobile"
                  onChange={(e) =>
                    setRegisterUser({ ...registerUser, mobile: e.target.value })
                  }
                  autoComplete="mobile"
                />
                <TextField
                  margin="normal"
                  required
                  name="password"
                  value={registerUser.password}
                  label="Password"
                  type="password"
                  id="password"
                  onChange={(e) =>
                    setRegisterUser({
                      ...registerUser,
                      password: e.target.value,
                    })
                  }
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isRegisterBtnDisabled}
                  sx={{ mt: 3, mb: 2, width: "30ch" }}
                >
                  Register
                </Button>
              </Box>
            </div>
          </TabPanel>
        </TabContext>
      </div>
    </div>
  );
};

export default Login;
