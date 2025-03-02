const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

/ * * * * Utils * * * * /;
const httpStatusText = require("./src/utils/httpStatusText");
/ * * * * End Utils * * * * /;

const PORT = process.env.PORT || 5000;

/ * * * * DB * * * /;
const connectDB = require("./src/config/db");
/ * * * * End Db * * * * /;

/ * * * * Router imports * * * * /;
const registerationRouter = require("./src/routes/registration.routes");
const userRouter = require("./src/routes/user.routes");
const categoreRouter = require("./src/routes/category.routes");
const productRouter = require("./src/routes/product.routes");
const postRouter = require("./src/routes/post.routes");
const checkoutRouter = require("./src/routes/checkout.routes");
const cartRouter = require("./src/routes/cart.routes");
const galleryRouter = require("./src/routes/gallery.routes");
/ * * * * End Router imports * * * * /;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("Hello in nodejs-app-starter");
});

/ * * * Routes * * * /;
app.use("/register", registerationRouter);
app.use("/user", userRouter);
app.use("/categories", categoreRouter);
app.use("/products", productRouter);
app.use("/posts", postRouter);
app.use("/checkout", checkoutRouter);
app.use("/cart", cartRouter);

app.use("/api", galleryRouter);

/ * * * Global MiddleWare * * * /;
// Not found routes
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "this resource is not avilable",
  });
});
// global error handlers
app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    status: error.statueText || httpStatusText.ERROR,
    error: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});
app.listen(PORT, () =>
  console.log(`i am running on: http://localhost:${PORT}`)
);
