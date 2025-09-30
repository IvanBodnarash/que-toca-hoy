"use strict";

module.exports = {
  async up(q) {
    const [users] = await q.sequelize.query(
      'SELECT "idUser","username" FROM "users" ORDER BY "idUser"'
    );
    const [groups] = await q.sequelize.query(
      'SELECT "idGroup","name" FROM "groups"'
    );
    const [tpls] = await q.sequelize.query(
      'SELECT "idTaskTemplate","name","idGroup" FROM "tasktemplates"'
    );

    const gid = Object.fromEntries(groups.map((g) => [g.name, g.idGroup]));
    const tpl = (gName, tName) =>
      tpls.find((t) => t.idGroup === gid[gName] && t.name === tName)
        .idTaskTemplate;

    const getTask = async (gName, tName, startIso) => {
      const [rows] = await q.sequelize.query(`
        SELECT "idTaskDated" FROM "tasksdated"
        WHERE "idGroup" = ${gid[gName]}
          AND "idTaskTemplate" = ${tpl(gName, tName)}
          AND "startDate" = '${startIso}'
        LIMIT 1
      `);
      return rows[0]?.idTaskDated;
    };

    // відповідно до seed-tasksdated
    const tCleanKitchen = await getTask(
      "Barcelona apartment",
      "Clean kitchen",
      "2025-09-01T10:00:00.000Z"
    );
    const tPaellaChicken = await getTask(
      "Barcelona apartment",
      "Paella (chicken)",
      "2025-09-01T11:00:00.000Z"
    );
    const tCleanBathroom = await getTask(
      "Madrid apartment",
      "Clean bathroom",
      "2025-09-02T09:00:00.000Z"
    );
    const tCaesar = await getTask(
      "Madrid apartment",
      "Caesar salad",
      "2025-09-02T12:00:00.000Z"
    );
    const tVacuumLiving = await getTask(
      "Barcelona apartment",
      "Vacuum living room",
      "2025-09-03T08:00:00.000Z"
    );
    const tBuyBread = await getTask(
      "Madrid apartment",
      "Buy bread",
      "2025-09-03T09:00:00.000Z"
    );
    const tDeep = await getTask(
      "Our cozy house",
      "Deep-clean bathroom",
      "2025-08-18T00:00:01.000Z"
    );
    const tWipe = await getTask(
      "Our cozy house",
      "Wipe kitchen surfaces",
      "2025-08-25T00:00:01.000Z"
    );
    const tWashDishes = await getTask(
      "Our cozy house",
      "Wash dishes",
      "2025-09-01T00:00:01.000Z"
    );
    const tVacuumBed = await getTask(
      "Our cozy house",
      "Vacuum bedrooms",
      "2025-08-25T00:00:01.000Z"
    );
    const tTakeOut = await getTask(
      "Our cozy house",
      "Take out garbage",
      "2025-09-01T00:00:01.000Z"
    );
    const tCuban = await getTask(
      "Our cozy house",
      "Cuban-style rice",
      "2025-09-04T00:00:01.000Z"
    );

    const U = users; // в порядку вставки

    const rows = [
      { idUser: U[0].idUser, idTaskDated: tCleanKitchen },
      { idUser: U[1].idUser, idTaskDated: tPaellaChicken },
      { idUser: U[2].idUser, idTaskDated: tCleanBathroom },
      { idUser: U[3].idUser, idTaskDated: tCaesar },
      { idUser: U[0].idUser, idTaskDated: tVacuumLiving },
      { idUser: U[1].idUser, idTaskDated: tBuyBread },
      { idUser: U[4].idUser, idTaskDated: tDeep },
      { idUser: U[5].idUser, idTaskDated: tWipe },
      { idUser: U[6].idUser, idTaskDated: tWashDishes },
      { idUser: U[7].idUser, idTaskDated: tVacuumBed },
      { idUser: U[5].idUser, idTaskDated: tTakeOut },
      { idUser: U[7].idUser, idTaskDated: tCuban },
    ].map((x) => ({
      ...x,
      status: "todo",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await q.bulkInsert("usertasks", rows);
  },

  async down(q) {
    await q.bulkDelete("usertasks", null, {});
  },
};
