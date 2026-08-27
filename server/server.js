// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// import connectDb from "./utils/connectDb.js";
// import authRouter from "./routes/auth.route.js";
// import userRouter from "./routes/user.route.js";
// import notesRouter from "./routes/genrate.route.js";
// import pdfRouter from "./routes/pdf.route.js";
// import creditRouter from "./routes/credits.route.js";
// import adminRouter from "./routes/admin.route.js";
// import paymentsRouter from "./routes/payments.route.js";

// // Always load the backend env from `server/.env` even if the process is started
// // from the repo root.
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.join(__dirname, ".env") });

// export const createApp = () => {
//   const app = express();

//   const rawOrigins =
//     process.env.CLIENT_URL || "http://localhost:5173,http://localhost:3000";
//   const allowedOrigins = rawOrigins
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);

//   app.use(
//     cors({
//       origin: (origin, cb) => {
//         if (!origin) return cb(null, true);
//         if (allowedOrigins.includes(origin)) return cb(null, true);
//         return cb(new Error("Not allowed by CORS"));
//       },
//       credentials: true,
//       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     })
//   );

//   app.use(express.json());
//   app.use(cookieParser());

//   app.get("/", (req, res) => {
//     res.json({ message: "ExamNotes AI Backend Running" });
//   });

//   app.use("/api/auth", authRouter);
//   app.use("/api/user", userRouter);
//   app.use("/api/notes", notesRouter);
//   app.use("/api/pdf", pdfRouter);
//   app.use("/api/credit", creditRouter);
//   app.use("/api/admin", adminRouter);
//   app.use("/api/payments", paymentsRouter);

//   app.use((req, res) => {
//     res.status(404).json({ message: "Not found" });
//   });

//   // Centralized error handler so we don't crash on unexpected exceptions.
//   app.use((err, req, res, next) => {
//     console.error("[server] Unhandled error:", err);
//     res
//       .status(err.statusCode || 500)
//       .json({ message: err.message || "Server error" });
//   });

//   return app;
// };

// export const startServer = async () => {
//   const PORT = Number(process.env.PORT) || 8000;
//   const app = createApp();

//   // Connect to DB first so handlers can return a clean 503 if Atlas is down,
//   // rather than timing out with a generic 500.
//   app.locals.dbConnected = await connectDb({ retries: 3 });

//   if (!app.locals.dbConnected) {
//     console.error(
//       "[db] Starting server without DB connection; DB-dependent routes will return 503."
//     );

//     // Keep retrying in the background so the app can recover automatically.
//     const retryIntervalMs = 30_000;
//     const timer = setInterval(async () => {
//       const ok = await connectDb({ retries: 1 });
//       if (ok) {
//         app.locals.dbConnected = true;
//         clearInterval(timer);
//         console.log("[db] Reconnected");
//       }
//     }, retryIntervalMs);
//   }

//   app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//   });
// };




import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDb from "./utils/connectDb.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import notesRouter from "./routes/genrate.route.js";
import pdfRouter from "./routes/pdf.route.js";
import adminRouter from "./routes/admin.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

export const createApp = () => {
  const app = express();

  const rawOrigins = process.env.CLIENT_URL || "";
  const allowedOrigins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.json({ message: "ExamNotes AI Backend Running" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/pdf", pdfRouter);
  app.use("/api/admin", adminRouter);

  app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  app.use((err, req, res, next) => {
    console.error("[server error]:", err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Server error",
    });
  });

  return app;
};

export const startServer = async () => {
  const PORT = process.env.PORT || 8000;
  const app = createApp();

  console.log("Starting server...");
  app.locals.dbConnected = await connectDb({ retries: 3 });

  if (!app.locals.dbConnected) {
    console.error("[db] No connection. Running without DB...");

    const retryInterval = setInterval(async () => {
      const ok = await connectDb({ retries: 1 });
      if (ok) {
        app.locals.dbConnected = true;
        clearInterval(retryInterval);
        console.log("[db] Reconnected successfully");
      }
    }, 30000);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
