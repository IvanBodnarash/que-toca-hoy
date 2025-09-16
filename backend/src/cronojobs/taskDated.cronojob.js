import { CronJob } from 'cron';
import { TaskDated, UserGroup, User, UserTask } from '../models/index.model.js';
import { Op } from "sequelize";

const todayMidnight = new Date();
todayMidnight.setHours(0, 0, 0, 0);

// función auxiliar para calcular número de semana
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

export const jobMidnight = new CronJob(
    '* * * * * *', // cada x sec
    async function () {
        try {
            // dame las taskDated que caducan despues de hoy a las 00:00 y que tienen frequency != a none
            const records = await TaskDated.findAll({
                where: {
                    endDate: {
                        [Op.gt]: todayMidnight,   // mayor que hoy 00:00
                    },
                    frequency: {
                        [Op.ne]: 'none',          // distinto de 'none'
                    },
                    status: {
                        [Op.eq]: "todo"
                    }
                },
            });

            // para cada una, comprobaremos si caduca hoy, si hay que repetirla y quien
            for (const recTask of records) {
                //const task = recTask.toJSON();
                const task = recTask;
                const now = new Date();
                let expira = null;
                //borrar
                let startDateSimulada = null;

                // obtener usuario de esta tarea
                const actUserTask = await UserTask.findOne({
                    where: { idTaskDated: task.idTaskDated }
                });

                const actUserId = actUserTask.idUser;

                expira = recTask.endDate;
                // borrar
                startDateSimulada = new Date(expira);

                switch (task.frequency) {
                    case 'daily':  // switch freq
                        expira.setDate(expira.getDate() + 1);
                        break;

                    case 'weekly': { // if (now.getDay() === 1) { // 1 = rotar lunes 
                        //const taskWeek = task.startDate.getWeek(); // ojo, JS no tiene getWeek() nativo
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

                    case 'monthly': {
                        const taskMonth = task.startDate.getMonth();
                        const nowMonth = now.getMonth();
                        if (taskMonth < nowMonth) { // si se creo el mes pasado
                            expira.setMonth(expira.getMonth() + 1);
                        } else {
                            continue; // no rotamos aún
                        }
                        break;
                    }

                    default:
                        continue;
                }


                expira.setHours(23, 0, 0);

                // a borrar
                startDateSimulada = new Date(expira);
                startDateSimulada.setHours(0, 0, 0, 0);

                const alreadyExists = await TaskDated.findOne({
                    where: {
                        idTaskTemplate: task.idTaskTemplate,
                        idGroup: task.idGroup,
                        startDate: { [Op.gte]: startDateSimulada } // puede ser [Op.gt] también
                    }
                });

                if (alreadyExists) {
                    console.log(`⏩ Ya existe una TaskDated futura para ${task.idTaskTemplate}, no se duplica`);
                    continue;
                }

                // Crear la nueva TaskDated
                const newTaskData = {
                    idGroup: task.idGroup,
                    idTaskTemplate: task.idTaskTemplate,
                    //startDate: now,
                    startDate: startDateSimulada,
                    endDate: expira,
                    status: 'todo',
                    frequency: task.frequency,
                    rotative: task.rotative
                };

                // Guardar nueva TaskDated
                const newTask = await TaskDated.create(newTaskData);

                /// esto a eliminar
                const expiredDate = new Date(task.endDate);
                expiredDate.setDate(expiredDate.getDate() - 2);

                await TaskDated.update({ endDate: expiredDate, status: "done" }, { where: { idTaskDated: task.idTaskDated } });
                ///

                // asignarsela al usuario correspondiente
                let idU;
                if (!task.rotative) {
                    // misma persona
                    idU = actUserId;
                } else {
                    // rotar entre usuarios del grupo
                    const groupUsers = await UserGroup.findAll({
                        where: { idGroup: task.idGroup },
                        include: [{ model: User, attributes: ['idUser', 'username'] }],
                        order: [[User, 'username', 'ASC']]
                    });

                    // buscar el índice del usuario actual
                    const idx = groupUsers.findIndex(u => u.idUser === actUserId);
                    // asignaremos la tarea al siguiente usuario por orden alfabetico
                    const nextUser = groupUsers[(idx + 1) % groupUsers.length];
                    

                    idU = nextUser.idUser;

                    console.log("actual usuario ", actUserId, " nuevo ", idU )
                }

                let addUserTask = {
                    idUser: idU,
                    idTaskDated: newTask.idTaskDated
                };

                const newUserTask = await UserTask.create(addUserTask);

                console.log(`Creada nueva TaskDated con id ${newTask.idTaskDated}`);
                console.log(`Creada nueva UserTask con id ${newUserTask.idUserTask}`);
            }

            const d = new Date();
            console.log('CronJob executed!:', d);
            this.stop();
        }

        catch (error) {
            console.error('Error in cron job:', error);
        }
    },
    null, // onComplete
    false  // start inmediatamente
);
