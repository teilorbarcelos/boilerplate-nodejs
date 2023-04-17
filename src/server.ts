import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { router } from "./routes";

const app = express();

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 4500, // Limit each IP to 4500 requests per `window` (here, per 60 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(router);
app.use(rateLimiter);

const port = process.env.PORT || 3300;

const server = app.listen(port, () =>
  console.log(`Server runing on http://localhost:${port}`)
);

const closeServer = async () => {
  server.close();
};

export { app, closeServer };
