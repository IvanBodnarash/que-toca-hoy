"use strict";

module.exports = {
  async up(q) {
    const [groups] = await q.sequelize.query(
      'SELECT "idGroup","name" FROM "groups"'
    );
    const [mats] = await q.sequelize.query(
      'SELECT "idMaterial","name" FROM "materials"'
    );
    const [tpls] = await q.sequelize.query(
      'SELECT "idTaskTemplate","name","idGroup" FROM "tasktemplates"'
    );

    const gid = Object.fromEntries(groups.map((g) => [g.name, g.idGroup]));
    const mid = Object.fromEntries(mats.map((m) => [m.name, m.idMaterial]));
    const tpl = (gName, tName) =>
      tpls.find((t) => t.idGroup === gid[gName] && t.name === tName)
        .idTaskTemplate;

    // Отримаємо потрібні TaskDated за унікальними парами (group+template+startDate)
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

    // Відповідає датам з seed-tasksdated
    const tBarcelonaPaella = await getTask(
      "Barcelona apartment",
      "Paella (chicken)",
      "2025-09-01T11:00:00.000Z"
    );
    const tBarcelonaClean = await getTask(
      "Barcelona apartment",
      "Clean kitchen",
      "2025-09-01T10:00:00.000Z"
    );
    const tMadridCaesar = await getTask(
      "Madrid apartment",
      "Caesar salad",
      "2025-09-02T12:00:00.000Z"
    );
    const tMadridBread = await getTask(
      "Madrid apartment",
      "Buy bread",
      "2025-09-03T09:00:00.000Z"
    );
    const tHouseDeep = await getTask(
      "Our cozy house",
      "Deep-clean bathroom",
      "2025-08-18T00:00:01.000Z"
    );
    const tHouseCubanRice = await getTask(
      "Our cozy house",
      "Cuban-style rice",
      "2025-09-04T00:00:01.000Z"
    );

    const rows = [
      // Paella (chicken)
      {
        idTaskDated: tBarcelonaPaella,
        idMaterial: mid["Rice"],
        quantity: 300,
        unit: "gr",
      },
      {
        idTaskDated: tBarcelonaPaella,
        idMaterial: mid["Chicken"],
        quantity: 500,
        unit: "gr",
      },
      {
        idTaskDated: tBarcelonaPaella,
        idMaterial: mid["Tomato"],
        quantity: 2,
        unit: "ud",
      },

      // Clean kitchen
      {
        idTaskDated: tBarcelonaClean,
        idMaterial: mid["Dish soap"],
        quantity: 100,
        unit: "ml",
      },

      // Caesar salad
      {
        idTaskDated: tMadridCaesar,
        idMaterial: mid["Lettuce"],
        quantity: 1,
        unit: "ud",
      },
      {
        idTaskDated: tMadridCaesar,
        idMaterial: mid["Chicken"],
        quantity: 200,
        unit: "gr",
      },
      {
        idTaskDated: tMadridCaesar,
        idMaterial: mid["Croutons"],
        quantity: 50,
        unit: "gr",
      },
      {
        idTaskDated: tMadridCaesar,
        idMaterial: mid["Parmesan"],
        quantity: 20,
        unit: "gr",
      },

      // Buy bread
      {
        idTaskDated: tMadridBread,
        idMaterial: mid["Bread"],
        quantity: 1,
        unit: "ud",
      },

      // Deep-clean bathroom
      {
        idTaskDated: tHouseDeep,
        idMaterial: mid["WC cleaner"],
        quantity: 100,
        unit: "ml",
      },
      {
        idTaskDated: tHouseDeep,
        idMaterial: mid["Toilet paper"],
        quantity: 2,
        unit: "ud",
      },

      // Cuban-style rice
      {
        idTaskDated: tHouseCubanRice,
        idMaterial: mid["Eggs"],
        quantity: 2,
        unit: "ud",
      },
      {
        idTaskDated: tHouseCubanRice,
        idMaterial: mid["Rice"],
        quantity: 200,
        unit: "gr",
      },
      {
        idTaskDated: tHouseCubanRice,
        idMaterial: mid["Tomato sauce"],
        quantity: 200,
        unit: "ml",
      },
    ].map((x) => ({ ...x, createdAt: new Date(), updatedAt: new Date() }));

    await q.bulkInsert("buylists", rows);
  },

  async down(q) {
    await q.bulkDelete("buylists", null, {});
  },
};
