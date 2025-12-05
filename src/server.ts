import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import errorHandling from "./middleware/error/errorHandler";
import authenticationRoutes from "./routes/authentication.route";
import testingRoutes from "./routes/testing.route";
import sysadminRoutes from "./routes/sysadmin.route";
import performance from "./routes/performace.route";

const app = express();
app.use(cors());
// app.use(cors()); www.example.com later restrict to specific domain
app.use(express.json({ limit: "5kb" }));
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Try again in one hour.",
});
app.use("/", limiter);
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Healthy" });
});
app.get("/", (req, res) => {
  res.status(200).json({ message: "Healthy" });
});

app.use("/api/sysadmin/", sysadminRoutes);
app.use("/api/auth", authenticationRoutes);
app.use("/api/testing", testingRoutes);
app.use("/api/performance", performance);

app.use(errorHandling);
export default app;
