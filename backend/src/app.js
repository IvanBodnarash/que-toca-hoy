import cors from "cors"; // to allow cross-origin requests (CORS) (from the browser)
import dotenv from "dotenv"; // to load the environment variables (configuration)
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Import models
import { sequelize } from "./models/index.model.js";

// Import middlewares
import { errorHandler } from "./middlewares/error.middleware.js";

// Import routes
import buyListRoutes from "./routes/buyList.routes.js";
import groupRoutes from "./routes/group.routes.js";
import materialRoutes from "./routes/material.routes.js";
import materialTaskTemplateRoutes from "./routes/materialTaskTemplate.routes.js";
import taskDatedRoutes from "./routes/taskDated.routes.js";
import taskTemplateRoutes from "./routes/taskTemplate.routes.js";
import userRoutes from "./routes/user.routes.js";
import userGroupRoutes from "./routes/userGroup.routes.js";
import userTaskRoutes from "./routes/userTask.routes.js";
import authRouter from "./routes/auth.routes.js";
import cronRouter from "./routes/cron.routes.js";

dotenv.config();
const app = express();

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "production") {
  const required = ["JWT_SECRET", "DATABASE_URL", "CLIENT_ORIGIN"];
  const miss = required.filter((k) => !process.env[k]);
  if (miss.length) {
    console.error("Missing required env:", miss.join(", "));
    process.exit(1);
  }
}

const allow = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allow.includes(origin);
}

app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/auth", authRouter);
app.use("/buylist", buyListRoutes); // buy list routes
app.use("/group", groupRoutes); // group routes
app.use("/material", materialRoutes); // materials routes
app.use("/materialtasktemplate", materialTaskTemplateRoutes); // material task template routes
app.use("/taskdated", taskDatedRoutes); // tasks routes
app.use("/tasktemplate", taskTemplateRoutes); // task template routes
app.use("/user", userRoutes); // users routes
app.use("/usergroup", userGroupRoutes); // user group routes
app.use("/usertask", userTaskRoutes); // user task routes
app.use("/cron", cronRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use(errorHandler);

// Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  // cors: {
  //   origin(origin, cb) {
  //     if (isAllowedOrigin(origin)) return cb(null, true);
  //     const err = new Error(`CORS: origin not allowed: ${origin}`);
  //     err.data = { code: "CORS_NOT_ALLOWED", origin };
  //     return cb(err, false);
  //   },
  //   credentials: true,
  // },
  cors: { origin: isAllowedOrigin, credentials: true },
  pingInterval: 15000,
  pingTimeout: 10000,
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(); // allow connect without user
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { idUser, username, iat, exp }
    return next();
  } catch {
    return next();
  }
});

io.on("connection", (socket) => {
  if (socket.user?.idUser) {
    const uid = Number(socket.user.idUser);
    socket.join(`user:${uid}`);
    console.log("joined user room", `user:${uid}`, socket.id);
  }

  socket.on("group:subscribe", (idGroup) => socket.join(`group:${idGroup}`));
  socket.on("group:unsubscribe", (idGroup) => socket.leave(`group:${idGroup}`));

  socket.on("calendar:subscribe", (idGroup) => {
    const gid = Number(idGroup);
    socket.join(`calendar:${gid}`);
    console.log("joined room", `calendar:${gid}`, socket.id);
  });
  socket.on("calendar:unsubscribe", (idGroup) => {
    const gid = Number(idGroup);
    socket.leave(`calendar:${gid}`);
  });

  console.log("WS connected", socket.id);
});

app.set("io", io);

const port = process.env.PORT || process.env.APP_PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ DB connected (${sequelize.getDialect()})`);

    // Schema & demo data are managed by migrations/seeders (sequelize-cli)

    const srv = server.listen(port, () =>
      console.log(`🚀 API listening on http://localhost:${port}`)
    );

    const close = async () => {
      try {
        console.log("Shutting down...");
        await new Promise((res) => io.close(res));
        await new Promise((res) => srv.close(res));
        await sequelize.close().catch(() => {});
      } finally {
        process.exit(0);
      }
    };

    process.on("SIGINT", close);
    process.on("SIGTERM", close);
  } catch (e) {
    console.error("Initialization error:", e);
    process.exit(1);
  }
})();

export default app;
