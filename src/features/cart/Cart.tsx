import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import {
  Order,
  Product,
  useDeleteUserOrderMutation,
  useLazyGetProductQuery,
  useUpdateUserOrdersMutation,
} from "../../api/productsApiSlice";
import {
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Alert,
  Modal,
  Fade,
  Box,
  Backdrop,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import { capitalizeFirstLetterOfEachWord } from "../product/Product";
import { useNavigate } from "react-router";
import { styled } from "@mui/material/styles";
import { decrementOrderData, incrementOrderData, resetOrderData } from "../product/productSlice";
import UserContext from "../../contexts/UserContext";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const order = useSelector(
    (state: RootState) => state.products.orders && state.products.orders[0]
  );
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [triggerGetProductQuery] = useLazyGetProductQuery();
  const [triggerUserOrdersUpdateMutation] = useUpdateUserOrdersMutation();
  const [triggerUserOrderDeleteMutation] = useDeleteUserOrderMutation();
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);

  const orderItems = (order && order.orderItems) || [];

  const subtotal = fetchedProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const CustomModalButton = styled(Button)(() => ({
    marginBottom: 0,
    width: "100%",
    border: "1px solid #000",
    "&:hover": {
      backgroundColor: "#1892D8",
      color: "#333",
      boxShadow: "none",
    },
  }));

  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 350,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "center",
    bgcolor: "background.paper",
    border: "2px solid #000",
    borderRadius: "10px",
    boxShadow: 24,
    "& .MuiTypography-root": {
      padding: "4px",
    },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const products: Product[] = [];
      for (const item of orderItems) {
        const productResultArray = (await triggerGetProductQuery(
          item.productId
        ).unwrap()) as unknown as Array<Product>;
        const product = { ...productResultArray[0], quantity: item.quantity };
        if (product) products.push(product);
      }
      setFetchedProducts(products);
    };

    fetchProducts();
  }, [orderItems]);

  const handleProductDelete = (productId: Product["id"]) => {
    const updatedProducts = orderItems.filter(
      (orderItem) => orderItem.productId !== productId
    );

    const productOrder: Order = {
      ...order,
      orderItems: updatedProducts,
    };

    triggerUserOrdersUpdateMutation(productOrder);
  };

  const handleProductIncrement = (productId: Product["id"]) => {
    if (!user.auth) {
      dispatch(incrementOrderData(productId));
      return;
    }

    const productIndex = order?.orderItems?.findIndex(
      (item) => item.productId === productId
    );

    if (productIndex !== undefined && productIndex !== -1) {
      const updatedOrder: Order = {
        ...order,
        orderItems: order?.orderItems?.map((item, index) =>
          index === productIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
      triggerUserOrdersUpdateMutation(updatedOrder);
    } else {
      console.error("Product not found in order.");
    }
  };

  const handleProductDecrement = (productId: Product["id"]) => {
    if (!user.auth) {
      dispatch(decrementOrderData(productId));
      return;
    }

    const productIndex = order?.orderItems?.findIndex(
      (item) => item.productId === productId
    );
    if (productIndex !== undefined && productIndex !== -1) {
      const product = order?.orderItems![productIndex];
      if (product?.quantity === 1) {
        handleProductDelete(productId);
      } else {
        const updatedOrder: Order = {
          ...order,
          orderItems: order?.orderItems?.map((item, index) =>
            index === productIndex
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        };
        triggerUserOrdersUpdateMutation(updatedOrder);
      }
    } else {
      console.error("Product not found in order.");
    }
  };

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => {
    setOpen(false)
    if (!user.auth) {
      dispatch(resetOrderData());
    } else {
      triggerUserOrderDeleteMutation(order?.id);
    }
    navigate("/")
  }

  return (
    <>
      {fetchedProducts.length < 1 ? (
        <h1>No products in cart</h1>
      ) : (
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={8}>
            {fetchedProducts.map((product) => {
              const imageUrl = require(`../../images/${product.name.toLowerCase()}.jpg`);
              return (
                <Paper
                  style={{
                    marginBottom: 20,
                    padding: 10,
                    border: "1px solid black",
                  }}
                >
                  <Grid container alignItems="center">
                    <Grid item xs={2}>
                      <img
                        src={imageUrl}
                        alt={product.name}
                        width="100%"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          marginLeft: "25px",
                        }}
                      >
                        <Typography variant="h6">
                          {capitalizeFirstLetterOfEachWord(product.name)}
                        </Typography>
                        <Typography variant="body1">
                          {product.price.toFixed(2)} LKR
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <IconButton
                        onClick={() => handleProductIncrement(product.id)}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                      <Paper
                        style={{
                          display: "inline-block",
                          padding: "2px 20px",
                          border: "1px solid black",
                        }}
                      >
                        {product.quantity}
                      </Paper>
                      <IconButton
                        onClick={() => handleProductDecrement(product.id)}
                        color="primary"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h6">
                        {(product.price * product.quantity).toFixed(2)} LKR
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        onClick={() => handleProductDelete(product.id)}
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              style={{
                padding: "20px",
                border: "1px solid black",
                textAlign: "end",
              }}
              sx={{
                "& .MuiButton-root": {
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                },
              }}
            >
              <Typography variant="h6">Subtotal Price</Typography>
              <Typography variant="body1">{subtotal.toFixed(2)} LKR</Typography>

              <div style={{ margin: "20px 0" }}>
                <Typography variant="h6">Discount</Typography>
                <Typography variant="body1">0 LKR</Typography>
              </div>

              <div style={{ margin: "20px 0" }}>
                <Typography variant="h6">Delivery</Typography>
                <Typography variant="body1">0 LKR</Typography>
              </div>

              <div style={{ margin: "20px 0" }}>
                <Typography variant="h6">Total Price</Typography>
                <Typography variant="body1">
                  {subtotal.toFixed(2)} LKR
                </Typography>
              </div>
              <Button
                onClick={handleModalOpen}
                variant="contained"
                color="primary"
              >
                Checkout
              </Button>
            </Paper>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              style={{ marginTop: "20px" }}
              color="primary"
            >
              Continue Shopping
            </Button>
          </Grid>
        </Grid>
      )}

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleModalClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Successfull
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              Your order has been successfully placed
            </Typography>
            <CustomModalButton
              onClick={handleModalClose}
              variant="outlined"
              sx={{ mt: 3 }}
            >
              Continue
            </CustomModalButton>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default Cart;
