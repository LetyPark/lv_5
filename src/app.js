import express from "express";
import authMiddleware from './middlewares/auth.middleware.js'
import categoryRouter from "./routes/categories.router.js";
import menuRouter from "./routes/menus.router.js";
import customerOrderRouter from "./routes/customerOrders.router.js"
import usersRouter from "./routes/users.router.js";
import cookieParser from "cookie-parser";
import errorHandlingMiddleware from "./middlewares/error-handling.middleware.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api", [categoryRouter, menuRouter, usersRouter, customerOrderRouter]);
app.use(authMiddleware);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
