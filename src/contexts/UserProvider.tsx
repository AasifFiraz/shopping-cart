import React, { ReactNode, useEffect, useState } from "react";
import UserContext, { UserState } from "./UserContext";
import { useNavigate, useLocation } from "react-router";
import { User } from "../api/userApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { clearUserSession, setUserSession } from "../features/login/userSlice";
import { resetCartData } from "../features/cart/cartSlice";

type UserProviderProps = {
  children: ReactNode;
};

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userSession = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();
  
  const initialUser: UserState = {
    username: userSession.username,
    auth: userSession.auth,
    email: userSession.email,
    id: userSession.id
  };

  const [user, setUser] = useState<UserState>(initialUser);

  useEffect(() => {
    if(user.auth && location.pathname === "/login") {
        navigate("/")
    }
  }, [navigate, user]);

  const login = (user: User) => {
    setUser({
      id: user.id,
      username: user.username,
      email: user.email,
      auth: true
    });
    dispatch(setUserSession({
      id: user.id,
      username: user.username,
      email: user.email,
      auth: true
    }));
    dispatch(resetCartData());
    navigate('/');
  };

  // Clear session in store & context on logout
  const logout = () => {
    dispatch(clearUserSession());
    dispatch(resetCartData());
    setUser({
      username: "",
      auth: false
    });
};

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
