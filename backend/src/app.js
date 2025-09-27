import cors from "cors"; // to allow cross-origin requests (CORS) (from the browser)
import dotenv from "dotenv"; // to load the environment variables (configuration)
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Import models
import {
  sequelize,
  User,
  Group,
  TaskTemplate,
  TaskDated,
  Material,
  MaterialTaskTemplate,
  BuyList,
  UserGroup,
  UserTask,
} from "../src/models/index.model.js";

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
import cronRouter from "./routes/cron.routes.js"

// Import cronojobs
import { jobMidnight } from "./cronojobs/taskDated.cronojob.js";

dotenv.config();
const app = express();

// app.set("trust proxy", 1); // in prod

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"], // vite dev server
    credentials: true, // allow cookies + auth headers
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // to allow requests from different origins from the browser

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

app.use(errorHandler);

// Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }
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

// Simple seeds in code (execute once if there is no data)
async function seedIfEmpty() {
  // User, Group, TaskTemplate, Task, Material, MaterialTaskTemplate, BuyList, UserGroup, UserTask
  // If an element is marked as /element, it means that in the database, the column is allowNull: true or has a default value
  const usersCount = await User.count();
  if (usersCount === 0) {
    // Users
    const usersData = [
      { name: "Ana Torres", email: "ana@example.com", username: "ana", password: "123456" },
      { name: "Juan Pérez", email: "juan@example.com", username: "juan", password: "123456" },
      { name: "Marta López", email: "marta@example.com", username: "marta", password: "123456" },
      { name: "Sergio Martínez", email: "sergio@example.com", username: "sergio", password: "123456" },
      { name: "Antonny", email: "antonny@example.com", username: "antonny", password: "123456", color:"#000000", image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/007.png" },
      { name: "Elena", email: "elena@example.com", username: "elena", password: "123456", color: "#FFBC42", image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/172.png" },
      { name: "Gerard", email: "gerard@example.com", username: "gerard", password: "123456", color: "#444741", image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/133.png" },
      { name: "Ivan", email: "ivan@example.com", username: "ivan", password: "123456", color: "#266AB6", image: "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/018.png" }
    ];
    for (let user of usersData) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    const users = await User.bulkCreate(usersData);

    // Group
    const groups = await Group.bulkCreate([
      {
        name: "Barcelona apartment",
        pin: "$$2b$10$c0RQM3UCfxPI.hI36bLaCOd1OJMVnqz3UrII5RfE4vZsPaz3b0Shm$10$YofT1NGWvI3Jm0u5kqgD2Ot9jRjqkb6nDqzjgvv3eHI82s1fA3p5u",
        pinEncrypted: "1c549f3152d96bd49a86610d:dff0e91efd1999c6:cfade6968e7917dc7eaaf755523e6fe2:90ad6ee6f2324d1a88b7b13c2f93eb9e:91a2fdb389a7e038faebd05c271d839d",
        image: "https://media.habitatapartments.com/photos/apartments/846x564/barcelona-balconies-10-livingroom.jpg"
      },
      {
        name: "Madrid apartment",
        pin: "$2b$10$AkmlqtK.zbR.aKrNv3LNsOet7B5o8HZaJifaabByDIkH9BCzNYN0m",
        pinEncrypted: "8e92cae9569fc0472da4d583:6b07a8c57bbc5b9a:b78369c32018c71404e9b4c79624464f",
        image: "https://luxuryrentalsmadrid.com/storage/app/uploads/public/639/9fb/90c/6399fb90cce58343045727.jpg"
      },
      {
        name: "Our cozy house",
        pin: "$10$DrJR8GcZSuRfqSWVQFlXxu5gj930DT9bSb9qm0Gya6e3s8X/JHlsG",
        pinEncrypted: "8b0c9fbb6d25ecffa632c2d7:d100896ebf84189b:0845b1e42fc6bcba2ada60d26cc2a477",
        image: "https://images.stockcake.com/public/f/e/f/fefec80b-9733-4b1c-bb16-354e59cb0bcb_large/cozy-pixel-home-stockcake.jpg"
      }
    ]);

    // Relation users - groups
    await UserGroup.bulkCreate([
      { idUser: users[0].idUser, idGroup: groups[0].idGroup },
      { idUser: users[1].idUser, idGroup: groups[0].idGroup },
      { idUser: users[2].idUser, idGroup: groups[1].idGroup },
      { idUser: users[3].idUser, idGroup: groups[1].idGroup },
      { idUser: users[4].idUser, idGroup: groups[2].idGroup },
      { idUser: users[5].idUser, idGroup: groups[2].idGroup },
      { idUser: users[6].idUser, idGroup: groups[2].idGroup },
      { idUser: users[7].idUser, idGroup: groups[2].idGroup },
    ]);

    // Tasks and recipes templates
    const taskTemplates = await TaskTemplate.bulkCreate([
      // Group 0
      { name: "Clean kitchen", steps: ["Sweep floor", "Mop floor", "Organize countertop"], idGroup: groups[0].idGroup, type: "task" },
      { name: "Take out trash", steps: ["Collect organic waste", "Collect plastics", "Collect paper", "Bring to container"], idGroup: groups[0].idGroup, type: "task" },
      { name: "Paella (chicken)", steps: ["Fry chicken", "Add rice", "Add vegetables", "Pour in broth"], idGroup: groups[0].idGroup, type: "recipe" },
      { name: "Spanish omelette", steps: ["Slice potatoes", "Fry potatoes", "Beat eggs", "Combine and set"], idGroup: groups[0].idGroup, type: "recipe" },
      { name: "Vacuum living room", steps: ["Plug in vacuum", "Vacuum carpet", "Empty dust container"], idGroup: groups[0].idGroup, type: "task" },

      // Group 1
      { name: "Clean bathroom", steps: ["Mop floor", "Clean mirror", "Disinfect toilet"], idGroup: groups[1].idGroup, type: "task" },
      { name: "Buy bread", steps: ["Go to bakery", "Choose a loaf", "Pay"], idGroup: groups[1].idGroup, type: "task" },
      { name: "Caesar salad", steps: ["Wash lettuce", "Slice chicken", "Add croutons", "Dress and toss"], idGroup: groups[1].idGroup, type: "recipe" },
      { name: "Weekly groceries", steps: ["Check pantry", "Write list", "Shop essentials"], idGroup: groups[1].idGroup, type: "task" },
      { name: "Roast chicken dinner", steps: ["Season chicken", "Roast in oven", "Rest and carve", "Serve with sides"], idGroup: groups[1].idGroup, type: "recipe" },

      // Group 2
      { name: "Deep-clean bathroom", steps: ["Remove items", "Apply cleaner", "Scrub all surfaces", "Dry surfaces"], idGroup: groups[2].idGroup, type: "task" },
      { name: "Wipe kitchen surfaces", steps: ["Wipe countertops", "Mop floor"], idGroup: groups[2].idGroup, type: "task" },
      { name: "Wash dishes", steps: ["Fill sink", "Apply dish soap", "Scrub", "Rinse"], idGroup: groups[2].idGroup, type: "task" },
      { name: "Vacuum bedrooms", steps: ["Plug in vacuum", "Vacuum each room"], idGroup: groups[2].idGroup, type: "task" },
      { name: "Take out garbage", steps: ["Collect bags", "Bring to container"], idGroup: groups[2].idGroup, type: "task" },
      { name: "Paella (simple)", steps: ["Prep ingredients", "Sauté base", "Cook rice", "Rest before serving"], idGroup: groups[2].idGroup, type: "recipe" },
      { name: "Spanish omelette (with onion)", steps: ["Peel potatoes", "Fry potatoes", "Beat eggs", "Mix with onion and cook"], idGroup: groups[2].idGroup, type: "recipe" },
      { name: "Cuban-style rice", steps: ["Cook rice", "Fry eggs", "Serve with tomato sauce"], idGroup: groups[2].idGroup, type: "recipe" },
    ]);

    // Materials
    const materials = await Material.bulkCreate([
      { name: "Rice", assumed: false },           // 0
      { name: "Chicken", assumed: false },        // 1
      { name: "Tomato", assumed: false },         // 2
      { name: "Potatoes", assumed: false },       // 3
      { name: "Eggs", assumed: false },           // 4
      { name: "Dish soap", assumed: false },      // 5
      { name: "Toilet paper", assumed: false },   // 6
      { name: "Lettuce", assumed: false },        // 7
      { name: "Croutons", assumed: false },       // 8
      { name: "Bread", assumed: false },          // 9
      { name: "Olive oil", assumed: false },      // 10
      { name: "Onion", assumed: false },          // 11
      { name: "WC cleaner", assumed: false },     // 12
      { name: "Tomato sauce", assumed: false },   // 13
      { name: "Salt", assumed: false },           // 14
      { name: "Black pepper", assumed: false },   // 15
      { name: "Garlic", assumed: false },         // 16
      { name: "Paprika", assumed: false },        // 17
      { name: "Parmesan", assumed: false },       // 18
      { name: "Whole chicken", assumed: false },  // 19
    ]);

    // Materials - templates (when needed)
    await MaterialTaskTemplate.bulkCreate([
      // Paella (chicken) -> template[2]
      { idMaterial: materials[0].idMaterial, idTaskTemplate: taskTemplates[2].idTaskTemplate, quantity: 300, unit: "g" },   // Rice
      { idMaterial: materials[1].idMaterial, idTaskTemplate: taskTemplates[2].idTaskTemplate, quantity: 500, unit: "g" },   // Chicken
      { idMaterial: materials[2].idMaterial, idTaskTemplate: taskTemplates[2].idTaskTemplate, quantity: 2,   unit: "pcs" }, // Tomato
      { idMaterial: materials[10].idMaterial, idTaskTemplate: taskTemplates[2].idTaskTemplate, quantity: 40,  unit: "ml" }, // Olive oil
      { idMaterial: materials[14].idMaterial, idTaskTemplate: taskTemplates[2].idTaskTemplate, quantity: 5,   unit: "g" },  // Salt

      // Spanish omelette -> template[3]
      { idMaterial: materials[3].idMaterial, idTaskTemplate: taskTemplates[3].idTaskTemplate, quantity: 400, unit: "g" },   // Potatoes
      { idMaterial: materials[4].idMaterial, idTaskTemplate: taskTemplates[3].idTaskTemplate, quantity: 4,   unit: "pcs" }, // Eggs
      { idMaterial: materials[10].idMaterial, idTaskTemplate: taskTemplates[3].idTaskTemplate, quantity: 50,  unit: "ml" }, // Olive oil

      // Clean kitchen -> template[0]
      { idMaterial: materials[5].idMaterial, idTaskTemplate: taskTemplates[0].idTaskTemplate, quantity: 100, unit: "ml" },  // Dish soap

      // Clean bathroom -> template[5]
      { idMaterial: materials[12].idMaterial, idTaskTemplate: taskTemplates[5].idTaskTemplate, quantity: 100, unit: "ml" }, // WC cleaner

      // Caesar salad -> template[7]
      { idMaterial: materials[7].idMaterial,  idTaskTemplate: taskTemplates[7].idTaskTemplate, quantity: 1,   unit: "pcs" }, // Lettuce
      { idMaterial: materials[1].idMaterial,  idTaskTemplate: taskTemplates[7].idTaskTemplate, quantity: 200, unit: "g" },   // Chicken
      { idMaterial: materials[8].idMaterial,  idTaskTemplate: taskTemplates[7].idTaskTemplate, quantity: 50,  unit: "g" },   // Croutons
      { idMaterial: materials[18].idMaterial, idTaskTemplate: taskTemplates[7].idTaskTemplate, quantity: 20,  unit: "g" },   // Parmesan

      // Buy bread -> template[6]
      { idMaterial: materials[9].idMaterial, idTaskTemplate: taskTemplates[6].idTaskTemplate, quantity: 1, unit: "pcs" }, // Bread

      // Paella (simple) -> template[15]
      { idMaterial: materials[0].idMaterial,  idTaskTemplate: taskTemplates[15].idTaskTemplate, quantity: 200, unit: "g" }, // Rice
      { idMaterial: materials[1].idMaterial,  idTaskTemplate: taskTemplates[15].idTaskTemplate, quantity: 300, unit: "g" }, // Chicken
      { idMaterial: materials[10].idMaterial, idTaskTemplate: taskTemplates[15].idTaskTemplate, quantity: 40,  unit: "ml" },// Olive oil
      { idMaterial: materials[14].idMaterial, idTaskTemplate: taskTemplates[15].idTaskTemplate, quantity: 5,   unit: "g" }, // Salt

      // Spanish omelette (with onion) -> template[16]
      { idMaterial: materials[3].idMaterial,  idTaskTemplate: taskTemplates[16].idTaskTemplate, quantity: 300, unit: "g" }, // Potatoes
      { idMaterial: materials[4].idMaterial,  idTaskTemplate: taskTemplates[16].idTaskTemplate, quantity: 4,   unit: "pcs" },// Eggs
      { idMaterial: materials[11].idMaterial, idTaskTemplate: taskTemplates[16].idTaskTemplate, quantity: 100, unit: "g" }, // Onion
      { idMaterial: materials[10].idMaterial, idTaskTemplate: taskTemplates[16].idTaskTemplate, quantity: 50,  unit: "ml" },// Olive oil

      // Deep-clean bathroom -> template[10]
      { idMaterial: materials[12].idMaterial, idTaskTemplate: taskTemplates[10].idTaskTemplate, quantity: 100, unit: "ml" }, // WC cleaner
      { idMaterial: materials[6].idMaterial,  idTaskTemplate: taskTemplates[10].idTaskTemplate, quantity: 2,   unit: "pcs" }, // Toilet paper

      // Roast chicken dinner -> template[9]
      { idMaterial: materials[19].idMaterial, idTaskTemplate: taskTemplates[9].idTaskTemplate, quantity: 1, unit: "pcs" },   // Whole chicken
      { idMaterial: materials[16].idMaterial, idTaskTemplate: taskTemplates[9].idTaskTemplate, quantity: 3, unit: "pcs" },   // Garlic
      { idMaterial: materials[17].idMaterial, idTaskTemplate: taskTemplates[9].idTaskTemplate, quantity: 5, unit: "g" },     // Paprika
      { idMaterial: materials[10].idMaterial, idTaskTemplate: taskTemplates[9].idTaskTemplate, quantity: 30, unit: "ml" },   // Olive oil
      { idMaterial: materials[14].idMaterial, idTaskTemplate: taskTemplates[9].idTaskTemplate, quantity: 5, unit: "g" },     // Salt
      { idMaterial: materials[15].idMaterial, idTaskTemplate: taskTemplates[9].idTaskTemplate, quantity: 2, unit: "g" },     // Black pepper
    ]);
    // Scheduled tasks
    const now = new Date();
    const tasks = await TaskDated.bulkCreate([
      { idGroup: groups[0].idGroup, idTaskTemplate: taskTemplates[0].idTaskTemplate,  startDate: now, endDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), status: "todo", frequency: "daily",   rotative: true  }, // Clean kitchen
      { idGroup: groups[0].idGroup, idTaskTemplate: taskTemplates[2].idTaskTemplate,  startDate: now, endDate: new Date(now.getTime() + 3 * 60 * 60 * 1000), status: "todo", frequency: "weekly", rotative: false }, // Paella (chicken)
      { idGroup: groups[1].idGroup, idTaskTemplate: taskTemplates[5].idTaskTemplate,  startDate: now, endDate: new Date(now.getTime() + 1.5 * 60 * 60 * 1000), status: "done", frequency: "monthly", rotative: true  }, // Clean bathroom
      { idGroup: groups[1].idGroup, idTaskTemplate: taskTemplates[7].idTaskTemplate,  startDate: now, endDate: new Date(now.getTime() + 1 * 60 * 60 * 1000),   status: "todo", frequency: "weekly", rotative: false }, // Caesar salad
      { idGroup: groups[0].idGroup, idTaskTemplate: taskTemplates[4].idTaskTemplate,  startDate: now, endDate: new Date(now.getTime() + 45 * 60 * 1000),       status: "done", frequency: "daily",   rotative: true  }, // Vacuum living room
      { idGroup: groups[1].idGroup, idTaskTemplate: taskTemplates[6].idTaskTemplate,  startDate: now, endDate: new Date(now.getTime() + 30 * 60 * 1000),       status: "todo", frequency: "daily",   rotative: false }, // Buy bread

      // Weekly/daily rotating (Group 2)
      { idGroup: groups[2].idGroup, idTaskTemplate: taskTemplates[10].idTaskTemplate, startDate: new Date("2025-08-18T00:00:01"), endDate: new Date("2025-08-24T23:59:59"), status: "done", frequency: "weekly", rotative: true  }, // Deep-clean bathroom
      { idGroup: groups[2].idGroup, idTaskTemplate: taskTemplates[11].idTaskTemplate, startDate: new Date("2025-08-25T00:00:01"), endDate: new Date("2025-08-31T23:59:59"), status: "todo", frequency: "weekly", rotative: true  }, // Wipe kitchen surfaces
      { idGroup: groups[2].idGroup, idTaskTemplate: taskTemplates[12].idTaskTemplate, startDate: new Date("2025-09-01T00:00:01"), endDate: new Date("2025-09-07T23:59:59"), status: "done", frequency: "weekly", rotative: true  }, // Wash dishes
      { idGroup: groups[2].idGroup, idTaskTemplate: taskTemplates[13].idTaskTemplate, startDate: new Date("2025-08-25T00:00:01"), endDate: new Date("2025-08-31T23:59:59"), status: "todo", frequency: "weekly", rotative: true  }, // Vacuum bedrooms
      { idGroup: groups[2].idGroup, idTaskTemplate: taskTemplates[14].idTaskTemplate, startDate: new Date("2025-09-01T00:00:01"), endDate: new Date("2025-09-01T23:59:59"), status: "todo", frequency: "daily",   rotative: true  }, // Take out garbage
      { idGroup: groups[2].idGroup, idTaskTemplate: taskTemplates[17].idTaskTemplate, startDate: new Date("2025-09-04T00:00:01"), endDate: new Date("2025-09-04T23:59:59"), status: "todo", frequency: "none",    rotative: false }, // Cuban-style rice
    ]);

    // Buy list
    await BuyList.bulkCreate([
      // Paella (chicken) weekly -> tasks[1]
      { idTaskDated: tasks[1].idTaskDated, idMaterial: materials[0].idMaterial, quantity: 300, unit: "g" },   // Rice
      { idTaskDated: tasks[1].idTaskDated, idMaterial: materials[1].idMaterial, quantity: 500, unit: "g" },   // Chicken
      { idTaskDated: tasks[1].idTaskDated, idMaterial: materials[2].idMaterial, quantity: 2,   unit: "pcs" }, // Tomato

      // Clean kitchen -> tasks[0]
      { idTaskDated: tasks[0].idTaskDated, idMaterial: materials[5].idMaterial, quantity: 100, unit: "ml" },  // Dish soap

      // Caesar salad weekly -> tasks[3]
      { idTaskDated: tasks[3].idTaskDated, idMaterial: materials[7].idMaterial,  quantity: 1,   unit: "pcs" }, // Lettuce
      { idTaskDated: tasks[3].idTaskDated, idMaterial: materials[1].idMaterial,  quantity: 200, unit: "g" },   // Chicken
      { idTaskDated: tasks[3].idTaskDated, idMaterial: materials[8].idMaterial,  quantity: 50,  unit: "g" },   // Croutons
      { idTaskDated: tasks[3].idTaskDated, idMaterial: materials[18].idMaterial, quantity: 20,  unit: "g" },   // Parmesan

      // Buy bread -> tasks[5]
      { idTaskDated: tasks[5].idTaskDated, idMaterial: materials[9].idMaterial, quantity: 1, unit: "pcs" },    // Bread

      // Deep-clean bathroom -> tasks[6]
      { idTaskDated: tasks[6].idTaskDated, idMaterial: materials[12].idMaterial, quantity: 100, unit: "ml" },  // WC cleaner
      { idTaskDated: tasks[6].idTaskDated, idMaterial: materials[6].idMaterial,  quantity: 2,   unit: "pcs" }, // Toilet paper

      // Cuban-style rice -> tasks[11]
      { idTaskDated: tasks[11].idTaskDated, idMaterial: materials[4].idMaterial,  quantity: 2,   unit: "pcs" }, // Eggs
      { idTaskDated: tasks[11].idTaskDated, idMaterial: materials[0].idMaterial,  quantity: 200, unit: "g" },   // Rice
      { idTaskDated: tasks[11].idTaskDated, idMaterial: materials[13].idMaterial, quantity: 200, unit: "ml" },  // Tomato sauce
    ]);

    // Users - tasks
    await UserTask.bulkCreate([
      { idUser: users[0].idUser, idTaskDated: tasks[0].idTaskDated },
      { idUser: users[1].idUser, idTaskDated: tasks[1].idTaskDated },
      { idUser: users[2].idUser, idTaskDated: tasks[2].idTaskDated },
      { idUser: users[3].idUser, idTaskDated: tasks[3].idTaskDated },
      { idUser: users[0].idUser, idTaskDated: tasks[4].idTaskDated },
      { idUser: users[1].idUser, idTaskDated: tasks[5].idTaskDated },
      { idUser: users[4].idUser, idTaskDated: tasks[6].idTaskDated },
      { idUser: users[5].idUser, idTaskDated: tasks[7].idTaskDated },
      { idUser: users[6].idUser, idTaskDated: tasks[8].idTaskDated },
      { idUser: users[7].idUser, idTaskDated: tasks[9].idTaskDated },
      { idUser: users[5].idUser, idTaskDated: tasks[10].idTaskDated },
      { idUser: users[7].idUser, idTaskDated: tasks[11].idTaskDated },
    ]);

    console.log("🌱 Sample data inserted.");

    const port = process.env.APP_PORT || 3000;

    console.log(`Starting server on port ${port}`);

  }

// Initiate cronjobs
//jobMidnight.start();
}

  const port = process.env.APP_PORT || 3000;

  (async () => {
    try {
      // console.log(process.env.DB_PASS, process.env.DB_USER);
      await sequelize.authenticate();
      console.log("✅ Connection with MySQL OK");

      // Create/update tables based on models (without migrations)
      await sequelize.sync({ alter: false });
      await seedIfEmpty();

      server.listen(port, () =>
        console.log(`🚀 API listening on http://localhost:${port}`)
      );

      const close = () => {
        console.log("Shutting down...");
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 3000);
      }
      process.on("SIGINT", close);
      process.on("SIGTERM", close);
    } catch (e) {
      console.error("Initialization error:", e);
      process.exit(1);
    }
  })();

  
  
export default app;
