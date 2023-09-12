import ProductComponent from "../../features/product/Product";
import { Box, Grid } from "@mui/material";
import { useContext, useEffect, useMemo } from "react";
import UserContext from "../../contexts/UserContext";
import {
  Cart,
  Product,
  useLazyGetProductsQuery,
} from "../../api/productsApiSlice";
import { useCreateUserCartMutation, useUpdateUserCartMutation } from "../../api/productsApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setProducts } from "../../features/product/productSlice";
import { setCart } from "../cart/cartSlice";

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const dispatch = useDispatch();
  const savedCarts = useSelector((state: RootState) => state.carts.savedCarts);
  const [triggerUserCartsUpdateMutation] = useUpdateUserCartMutation();
  const [triggerCreateUserCartMutation] = useCreateUserCartMutation();
  const [triggerGetProductsQuery, { data: products }] =
    useLazyGetProductsQuery();
  const searchKeyword = useSelector(
    (state: RootState) => state.products.searchKeyword
  );

  useEffect(() => {
    triggerGetProductsQuery();
  }, []);

  useEffect(() => {
    dispatch(setProducts(products))
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!products || !searchKeyword) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [products, searchKeyword]);

  const handleAddToCart = (product: Product): void => {
    const cart = savedCarts ? savedCarts[0] : null;
    const currentUserCarts = (cart && cart.cartItems) || [];
    const existingProductCart = currentUserCarts.find(
      (item) => item.productId === product.id
    );

    let updatedCartItems;

    if (existingProductCart) {
      updatedCartItems = currentUserCarts.map((item) => {
        if (item.productId === product.id) {
          return {
            ...item,
            quantity: item.quantity + 1,
            priceAtTimeOfPurchase: product.price,
          };
        }
        return item;
      });
    } else {
      updatedCartItems = [
        ...currentUserCarts,
        {
          productId: product.id,
          quantity: 1,
          priceAtTimeOfPurchase: product.price,
        },
      ];
    }

    const productCart: Cart = {
      ...cart,
      id: cart?.id,
      userId: user.id,
      cartItems: updatedCartItems,
    };

    if (!user.auth) {
      dispatch(setCart([productCart]));
    } else if (cart?.userId) {
      triggerUserCartsUpdateMutation(productCart);
    } else {
      triggerCreateUserCartMutation(productCart);
    }
  };

  useEffect(() => {
    triggerGetProductsQuery();
  }, []);

  return (
    <>
      <Box sx={{ flexGrow: 1, marginTop: 10 }}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {filteredProducts &&
            filteredProducts.map((product, index) => (
              <ProductComponent
                product={product}
                handleAddToCart={handleAddToCart}
                key={index}
                index={index}
              ></ProductComponent>
            ))}
        </Grid>
      </Box>
    </>
  );
}
