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
import { useContext, useEffect, useMemo } from "react";
import UserContext from "../contexts/UserContext";
import { useLazyGetSavedCartsQuery } from "../api/productsApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  setSearchKeyword,
} from "../features/product/productSlice";
import { setCartError, setCartLoading, setCart } from "../features/cart/cartSlice";

const LoginText = styled(Link)(() => ({
  fontWeight: "bold",
  textDecoration: "underline",
  marginRight: "1rem",
  cursor: "pointer",
}));


const HomePageLayout = () => {
  const { user, logout } = useContext(UserContext);
  const dispatch = useDispatch();
  const cartStatus = useSelector((state: RootState) => state.carts.status);
  const savedCarts = useSelector((state: RootState) => state.carts.savedCarts);
  const lastLogin = useSelector((state: RootState) => state.users.lastLogin);
  const [triggerGetCartsQuery, { data: carts, isLoading, error }] =
  useLazyGetSavedCartsQuery();

  const navigate = useNavigate();

const handleChangeSearch = debounce((value: string) => {
  dispatch(setSearchKeyword(value));
}, 300);

  const currentUserCart = useMemo(
    () => savedCarts?.find((cart) => cart.userId === user.id),
    [savedCarts, user.id]
  );

  const totalQuantity = useMemo(() => {
    const cartItems = currentUserCart?.cartItems;
    return (
      cartItems?.reduce((accum, currItem) => accum + currItem.quantity, 0) || 0
    );
  }, [currentUserCart]);

  const setAndGetCarts = () => {
    if (isLoading) {
      dispatch(setCartLoading());
    } else if (carts) {
      dispatch(setCart(carts));
    } else if (error) {
      dispatch(setCartError(error));
    }
  };

  useEffect(() => {
    if (user.id && cartStatus !== "succeeded") {
      triggerGetCartsQuery(user.id);
    }
  }, [cartStatus, user.id]);

  useEffect(() => {
    if (user.id) {
      setAndGetCarts();
    }
  }, [isLoading, carts, error, user.id]);

  useEffect(() => {
    if (lastLogin && user.id) {
      triggerGetCartsQuery(user.id);
      setAndGetCarts();
    }
  }, [lastLogin, triggerGetCartsQuery, user.id]);

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
