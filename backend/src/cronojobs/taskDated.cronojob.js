import { CronJob } from "cron";
import { TaskDated, UserGroup, User, UserTask } from "../models/index.model.js";
import { Op } from "sequelize";

const todayMidnight = new Date();
todayMidnight.setHours(0, 0, 0, 0);

// Helper function to calculate week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

export const jobMidnight = new CronJob(
  "* * * * * *", // each x sec
  async function () {
    try {
      // Give me the tasksDated that expire after today at 00:00 and that have frequency != none
      const records = await TaskDated.findAll({
        where: {
          endDate: {
            [Op.gt]: todayMidnight, // older than today 00:00
          },
          frequency: {
            [Op.ne]: "none",
          },
          status: {
            [Op.eq]: "todo",
          },
        },
      });

      // For each one, we will check if it expires today, if it needs to be repeated and who
      for (const recTask of records) {
        // const task = recTask.toJSON();
        const task = recTask;
        const now = new Date();
        let expira = null;
        // delete
        let startDateSimulada = null;

        // get user of this task
        const actUserTask = await UserTask.findOne({
          where: { idTaskDated: task.idTaskDated },
        });

        const actUserId = actUserTask.idUser;

        expira = recTask.endDate;
        // delete
        startDateSimulada = new Date(expira);

        switch (task.frequency) {
          case "daily": // switch freq
            expira.setDate(expira.getDate() + 1);
            break;

          case "weekly": {
            // if (now.getDay() === 1) { // 1 = rotate monday
            //const taskWeek = task.startDate.getWeek(); // Note, JS does not have native getWeek()
            const end = new Date(task.endDate);
            end.setHours(0, 0, 0, 0);

            const nowMid = new Date();
            nowMid.setHours(0, 0, 0, 0);

            if (nowMid.getTime() >= end.getTime()) {
              // expira.setDate(expira.getDate() + 14);
              expira.setDate(expira.getDate() + 7);
            } else {
              continue;
            }

            break;
          }

          case "monthly": {
            const taskMonth = task.startDate.getMonth();
            const nowMonth = now.getMonth();
            if (taskMonth < nowMonth) {
              // if it was created last month
              expira.setMonth(expira.getMonth() + 1);
            } else {
              continue; // we haven't rotated yet
            }
            break;
          }

          default:
            continue;
        }

        expira.setHours(23, 0, 0);

        // to delete
        startDateSimulada = new Date(expira);
        startDateSimulada.setHours(0, 0, 0, 0);

        const alreadyExists = await TaskDated.findOne({
          where: {
            idTaskTemplate: task.idTaskTemplate,
            idGroup: task.idGroup,
            startDate: { [Op.gte]: startDateSimulada },
          },
        });

        if (alreadyExists) {
          console.log(
            `There is already a future TaskData for ${task.idTaskTemplate}, not duplicated`
          );
          continue;
        }

        // Create the new TaskDated
        const newTaskData = {
          idGroup: task.idGroup,
          idTaskTemplate: task.idTaskTemplate,
          //startDate: now,
          startDate: startDateSimulada,
          endDate: expira,
          status: "todo",
          frequency: task.frequency,
          rotative: task.rotative,
        };

        // Save new TaskDated
        const newTask = await TaskDated.create(newTaskData);

        /// this to delete
        const expiredDate = new Date(task.endDate);
        expiredDate.setDate(expiredDate.getDate() - 2);

        await TaskDated.update(
          { endDate: expiredDate, status: "done" },
          { where: { idTaskDated: task.idTaskDated } }
        );
        ///

        // assign to the corresponding user
        let idU;
        if (!task.rotative) {
          // the same person
          idU = actUserId;
        } else {
          // rotate between users in the group
          const groupUsers = await UserGroup.findAll({
            where: { idGroup: task.idGroup },
            include: [{ model: User, attributes: ["idUser", "username"] }],
            order: [[User, "username", "ASC"]],
          });

          // find the index of the current user
          const idx = groupUsers.findIndex((u) => u.idUser === actUserId);
          // we will assign the task to the next user in alphabetical order
          const nextUser = groupUsers[(idx + 1) % groupUsers.length];

          idU = nextUser.idUser;

          console.log("current user ", actUserId, " new ", idU);
        }

        let addUserTask = {
          idUser: idU,
          idTaskDated: newTask.idTaskDated,
        };

        const newUserTask = await UserTask.create(addUserTask);

        console.log(`Created the new TaskDated with id ${newTask.idTaskDated}`);
        console.log(
          `Created the new UserTask with id ${newUserTask.idUserTask}`
        );
      }

      const d = new Date();
      console.log("CronJob executed!:", d);
      this.stop();
    } catch (error) {
      console.error("Error in cron job:", error);
    }
  },
  null, // onComplete
  false // start immediately
);
