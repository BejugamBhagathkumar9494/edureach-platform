import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.ts";
import authRoutes from "./routes/auth.routes.ts";
import errorHandler from "./middleware/error-handler.middleware.ts";
import vapiRoutes from "./routes/vapi.routes.ts";


const app: Application = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://edureach-platform-kzjp.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:") ||
        origin === process.env.CLIENT_URL;

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vapi", vapiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorHandler);

export default app;