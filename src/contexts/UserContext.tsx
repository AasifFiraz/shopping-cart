import { createContext } from "react";
import { User } from "../api/userApiSlice";

export type UserState = {
  id?: string;
  username: string;
  email?: string;
  auth: boolean;
  lastLogin?: string | null;
};
 
type UserContextType = {
  user: UserState;
  login: (user: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: { username: "", auth: false },
  login: () => {},
  logout: () => {},
});

export default UserContext;
