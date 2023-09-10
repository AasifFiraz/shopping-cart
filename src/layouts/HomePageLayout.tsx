import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import debounce from "lodash/debounce";
import {
  Box,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Badge from "@mui/material/Badge";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import UserContext from "../contexts/UserContext";
import {
  useLazyGetOrderedProductsQuery,
  useLazyGetProductsQuery,
} from "../api/productsApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  setOrderData,
  setOrderError,
  setOrderLoading,
  setSearchKeyword,
} from "../features/product/productSlice";

const LoginText = styled(Link)(() => ({
  fontWeight: "bold",
  textDecoration: "underline",
  marginRight: "1rem",
  cursor: "pointer",
}));


const HomePageLayout = () => {
  const { user, logout } = useContext(UserContext);
  const dispatch = useDispatch();
  const orderStatus = useSelector((state: RootState) => state.products.status);
  const orderData = useSelector((state: RootState) => state.products.orders);
  const lastLogin = useSelector((state: RootState) => state.users.lastLogin);
  const [triggerGetOrdersQuery, { data: orderedProducts, isLoading, error }] =
    useLazyGetOrderedProductsQuery();

  const navigate = useNavigate();

const handleChangeSearch = debounce((value: string) => {
  dispatch(setSearchKeyword(value));
}, 300);

  const currentUserOrder = useMemo(
    () => orderData?.find((order) => order.userId === user.id),
    [orderData, user.id]
  );

  const totalQuantity = useMemo(() => {
    const orderItems = currentUserOrder?.orderItems;
    return (
      orderItems?.reduce((accum, currItem) => accum + currItem.quantity, 0) || 0
    );
  }, [currentUserOrder]);

  const setAndGetOrders = () => {
    if (isLoading) {
      dispatch(setOrderLoading());
    } else if (orderedProducts) {
      dispatch(setOrderData(orderedProducts));
    } else if (error) {
      dispatch(setOrderError(error));
    }
  };

  useEffect(() => {
    if (user.id && orderStatus !== "succeeded") {
      triggerGetOrdersQuery(user.id);
    }
  }, [orderStatus, user.id]);

  useEffect(() => {
    if (user.id) {
      setAndGetOrders();
    }
  }, [isLoading, orderedProducts, error, user.id]);

  useEffect(() => {
    if (lastLogin && user.id) {
      triggerGetOrdersQuery(user.id);
      setAndGetOrders();
    }
  }, [lastLogin, triggerGetOrdersQuery, user.id]);

  return (
    <Container sx={{ padding: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "2rem",
          width: "100%",
        }}
      >
        <TextField
          id="search-shop"
          placeholder="Search"
          variant="outlined"
          onChange={(event) => handleChangeSearch(event.target.value)}
          sx={{ borderRadius: "40px", "& fieldset": { borderRadius: "40px" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "action.active" }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user.auth ? (
            <Typography onClick={() => logout()} variant="h5" mr={4}>
              {user.username}
            </Typography>
          ) : (
            <LoginText to="/login">Login</LoginText>
          )}
          <Badge badgeContent={totalQuantity} color="secondary">
            <ShoppingCartIcon
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/cart")}
            />
          </Badge>
        </Box>
      </Box>
      <Outlet />
    </Container>
  );
};

export default HomePageLayout;
