import express from "express";
import routes from "./routes";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/", routes);

export default app;
