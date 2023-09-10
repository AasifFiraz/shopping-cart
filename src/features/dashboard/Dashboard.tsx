import ProductComponent from "../../features/product/Product";
import { Box, Grid } from "@mui/material";
import { useContext, useEffect, useMemo } from "react";
import UserContext from "../../contexts/UserContext";
import {
  Order,
  Product,
  useCreateUserOrdersMutation,
  useLazyGetProductsQuery,
  useUpdateUserOrdersMutation,
} from "../../api/productsApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setOrderData, setProducts } from "../../features/product/productSlice";

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const dispatch = useDispatch();
  const orderData = useSelector((state: RootState) => state.products.orders);
  const [triggerUserOrdersUpdateMutation] = useUpdateUserOrdersMutation();
  const [triggerCreateUserOrderMutation] = useCreateUserOrdersMutation();
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
    const order = orderData ? orderData[0] : null;
    const currentOrderedProducts = (order && order.orderItems) || [];
    const existingProductOrder = currentOrderedProducts.find(
      (item) => item.productId === product.id
    );

    let updatedOrderItems;

    if (existingProductOrder) {
      updatedOrderItems = currentOrderedProducts.map((item) => {
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
      updatedOrderItems = [
        ...currentOrderedProducts,
        {
          productId: product.id,
          quantity: 1,
          priceAtTimeOfPurchase: product.price,
        },
      ];
    }

    const productOrder: Order = {
      ...order,
      id: order?.id,
      userId: user.id,
      orderItems: updatedOrderItems,
    };

    if (!user.auth) {
      dispatch(setOrderData([productOrder]));
    } else if (order?.userId) {
      triggerUserOrdersUpdateMutation(productOrder);
    } else {
      triggerCreateUserOrderMutation(productOrder);
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
