import { useRoutes } from "react-router-dom";
import UnauthorizedLayout from "./layouts/UnauthorizedLayout";
import Dashboard from "./features/dashboard/Dashboard";
import Home from "./features/home/Home";
import About from "./features/help/Help";
import HomePageLayout from "./layouts/HomePageLayout";
import Login from "./features/login/Login";
import CartComponent from "./features/cart/Cart";


export default function AppRoutes() {
  return useRoutes([
    {
      element: <HomePageLayout/>,
      children: [
        {path: "/", element: <Dashboard/>},
        {path: "cart", element: <CartComponent/>},
      ]
    },
    {
      element: <UnauthorizedLayout/>,
      children: [
        {path: "login", element: <Login/>},
        {path: "home", element: <Home/>},
        {path: "about", element: <About/>}
      ],
    },
  ]);
}
