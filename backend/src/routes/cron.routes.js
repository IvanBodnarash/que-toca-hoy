import { Router } from "express";
import { jobMidnight } from "../cronojobs/taskDated.cronojob.js";

const cronRouter = Router();

cronRouter.post("/start-cron", (req, res) => {
  if (!jobMidnight.running) {
    jobMidnight.start();
    return res.status(200).json({ message: "CronJob started." });
  } else {
    return res.status(400).json({ message: "CronJob already started." });
  }
});

cronRouter.post("/stop-cron", (req, res) => {
  if (jobMidnight.running) {
    jobMidnight.stop();
    return res.status(200).json({ message: "CronJob stopped." });
  } else {
    return res.status(400).json({ message: "CronJob was not running." });
  }
});

export default cronRouter;
