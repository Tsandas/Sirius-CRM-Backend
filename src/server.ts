import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import errorHandling from "./middleware/error/errorHandler";
import authenticationRoutes from "./routes/authentication.route";
import testingRoutes from "./routes/testing.route";
import sysadminRoutes from "./routes/sysadmin.route";
import performance from "./routes/performace.route";
import tradersRoutes from "./routes/traders.route";
import taskRoutes from "./routes/task.route";
import cookieParser from "cookie-parser";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = ["http://localhost:8080", "https://sirius-crm.online"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
// app.use(
//   cors({
//     origin: "https://api.sirius-crm.online",
//   })
// );
app.use(cookieParser());
app.use(express.json({ limit: "5kb" }));
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Try again in one hour.",
});
app.use("/", limiter);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Healthy" });
});
app.get("/", (req, res) => {
  res.status(200).json({ status: "Server is up" });
});

app.use("/internal/sysadmin/", sysadminRoutes);
app.use("/internal/performance", performance);

app.use("/api/auth", authenticationRoutes);
app.use("/api/testing", testingRoutes);

app.use("/api/traders/", tradersRoutes);
app.use("/api/tasks/", taskRoutes);

app.use(errorHandling);
export default app;
