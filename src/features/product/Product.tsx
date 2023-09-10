import { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Rating,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { styled } from "@mui/material/styles";
import DoneIcon from "@mui/icons-material/Done";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import {
  Product,
  UserRating,
  useCreateUserRatingMutation,
  useLazyGetUserRatingsQuery,
  useUpdateProductRatingMutation,
  useUpdateUserRatingMutation,
} from "../../api/productsApiSlice";
import UserContext from "../../contexts/UserContext";

type ProductProps = {
  product: Product;
  handleAddToCart: Function;
  index?: number;
};

export const CustomCardButton = styled(Button)(() => ({
  marginTop: 3,
  "&:hover": {
    backgroundColor: "#1892D8",
    color: "#333",
    boxShadow: "none",
  },
}));

export const capitalizeFirstLetterOfEachWord = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const ProductComponent: React.FC<ProductProps> = ({
  product,
  handleAddToCart,
  index,
}) => {
  const { user } = useContext(UserContext);
  const [triggerGetUserRatingsQuery, { data: userRating }] =
    useLazyGetUserRatingsQuery();
  const [triggerUpdateProductRatingMutation] = useUpdateProductRatingMutation();
  const [triggerUpdateUserRatingMutation] = useUpdateUserRatingMutation();
  const [triggerCreateUserRatingMutation] = useCreateUserRatingMutation();
  const [value, setValue] = useState<number | null>(null);
  const [_, setHover] = useState(-1);
  const [isRating, setIsRating] = useState<{ [key: string]: boolean }>({});
  const imageUrl = require(`../../images/${product.name.toLowerCase()}.jpg`);
  const averageRating = product.totalRatingScore / product.totalRatings;
  const productIsRating = isRating[product.id];
  const productRatings = userRating?.ratedProducts;

  const handleRateClick = (product: Product): void => {
    const averageRating = product.totalRatingScore / product.totalRatings;
    setValue(averageRating);

    setIsRating((prevState) => ({ ...prevState, [product.id]: true }));
  };

  const handleSubmitRating = (product: Product): void => {
    const updatedRatingScore = product.totalRatingScore + (value ? value : 0);
    const updatedTotalRatings = product.totalRatings + 1;
    const currentRatedProducts = userRating?.ratedProducts || [];

    const userRatingData: UserRating = {
      userId: user.id,
      ratedProducts: [
        ...currentRatedProducts,
        {
          productId: product.id,
          rating: value ? value : 0,
        },
      ],
    };

    triggerUpdateProductRatingMutation({
      ...product,
      totalRatings: updatedTotalRatings,
      totalRatingScore: updatedRatingScore,
    }).then((result) => {
      if (result) {
        if (userRating) {
          userRatingData.id = userRating.id;
          triggerUpdateUserRatingMutation(userRatingData);
        } else {
          triggerCreateUserRatingMutation(userRatingData);
          triggerGetUserRatingsQuery(user.id);
        }
      }
    });

    setIsRating((prevState) => ({ ...prevState, [product.id]: false }));
  };

  useEffect(() => {
    triggerGetUserRatingsQuery(user.id);
  }, [triggerGetUserRatingsQuery, user.id]);

  const isProductAlreadyRated = useMemo(() => {
    return productRatings?.some((rating) => rating.productId === product.id);
  }, [productRatings, product.id]);

  return (
    <Grid item xs={2} sm={4} md={4} key={index}>
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="140"
            image={imageUrl}
            loading="lazy"
            alt="green iguana"
          />
          <CardContent style={{ padding: 20, textAlign: "left" }}>
            <Typography gutterBottom variant="h6" component="div">
              {capitalizeFirstLetterOfEachWord(product.name)}
            </Typography>
            <Typography color="text.primary">Rs. {product.price}</Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {productIsRating ? (
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid grey",
                    width: "100%",
                    display: "flex",
                    height: 10,
                    margin: "10px auto",
                    alignItems: "center",
                  }}
                >
                  <Rating
                    name="hover-feedback"
                    value={value}
                    precision={0.5}
                    onChange={(event, newValue) => {
                      setValue(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                      setHover(newHover);
                    }}
                    emptyIcon={
                      <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                    }
                  />
                  <CancelIcon
                    onClick={() =>
                      setIsRating((prevState) => ({
                        ...prevState,
                        [product.id]: false,
                      }))
                    }
                    sx={{
                      marginLeft: 2,
                      height: "25px",
                      color: "grey",
                      width: "2rem",
                      border: "2px solid grey",
                      "&:hover": {
                        backgroundColor: "grey",
                        color: "#333",
                        boxShadow: "none",
                      },
                    }}
                  />
                  <DoneIcon
                    onClick={() => handleSubmitRating(product)}
                    sx={{
                      marginLeft: 2,
                      height: "25px",
                      color: "#FF9529",
                      width: "2rem",
                      border: "2px solid #FF9529",
                      "&:hover": {
                        backgroundColor: "#FF9529",
                        color: "#333",
                        boxShadow: "none",
                      },
                    }}
                  />
                </Box>
              ) : (
                <>
                  <Rating
                    name={`rating-${product.id}`}
                    value={averageRating}
                    precision={0.5}
                    readOnly
                    emptyIcon={
                      <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                    }
                  />
                  {user.auth && !isProductAlreadyRated && (
                    <CustomCardButton
                      variant="outlined"
                      sx={{ marginLeft: 10 }}
                      startIcon={<ThumbsUpDownIcon />}
                      onClick={() => handleRateClick(product)}
                    >
                      Rate
                    </CustomCardButton>
                  )}
                </>
              )}
            </Box>
            <CustomCardButton
              onClick={() => handleAddToCart(product)}
              variant="outlined"
              sx={{ mt: 3 }}
              startIcon={<AddIcon />}
            >
              Add to cart
            </CustomCardButton>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default ProductComponent;
