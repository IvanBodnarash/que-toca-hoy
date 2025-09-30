"use strict";

module.exports = {
  async up(q) {
    const [materials] = await q.sequelize.query(
      'SELECT "idMaterial","name" FROM "materials"'
    );
    const [groups] = await q.sequelize.query(
      'SELECT "idGroup","name" FROM "groups"'
    );
    const [tpls] = await q.sequelize.query(
      'SELECT "idTaskTemplate","name","idGroup" FROM "tasktemplates"'
    );

    const mid = Object.fromEntries(
      materials.map((m) => [m.name, m.idMaterial])
    );
    const gid = Object.fromEntries(groups.map((g) => [g.name, g.idGroup]));
    const tpl = (gName, tName) =>
      tpls.find((t) => t.idGroup === gid[gName] && t.name === tName)
        .idTaskTemplate;

    const rows = [
      // Paella (chicken) @ Barcelona
      {
        idMaterial: mid["Rice"],
        idTaskTemplate: tpl("Barcelona apartment", "Paella (chicken)"),
        quantity: 300,
        unit: "gr",
      },
      {
        idMaterial: mid["Chicken"],
        idTaskTemplate: tpl("Barcelona apartment", "Paella (chicken)"),
        quantity: 500,
        unit: "gr",
      },
      {
        idMaterial: mid["Tomato"],
        idTaskTemplate: tpl("Barcelona apartment", "Paella (chicken)"),
        quantity: 2,
        unit: "ud",
      },
      {
        idMaterial: mid["Olive oil"],
        idTaskTemplate: tpl("Barcelona apartment", "Paella (chicken)"),
        quantity: 40,
        unit: "ml",
      },
      {
        idMaterial: mid["Salt"],
        idTaskTemplate: tpl("Barcelona apartment", "Paella (chicken)"),
        quantity: 5,
        unit: "gr",
      },

      // Spanish omelette @ Barcelona
      {
        idMaterial: mid["Potatoes"],
        idTaskTemplate: tpl("Barcelona apartment", "Spanish omelette"),
        quantity: 400,
        unit: "gr",
      },
      {
        idMaterial: mid["Eggs"],
        idTaskTemplate: tpl("Barcelona apartment", "Spanish omelette"),
        quantity: 4,
        unit: "ud",
      },
      {
        idMaterial: mid["Olive oil"],
        idTaskTemplate: tpl("Barcelona apartment", "Spanish omelette"),
        quantity: 50,
        unit: "ml",
      },

      // Clean kitchen @ Barcelona
      {
        idMaterial: mid["Dish soap"],
        idTaskTemplate: tpl("Barcelona apartment", "Clean kitchen"),
        quantity: 100,
        unit: "ml",
      },

      // Clean bathroom @ Madrid
      {
        idMaterial: mid["WC cleaner"],
        idTaskTemplate: tpl("Madrid apartment", "Clean bathroom"),
        quantity: 100,
        unit: "ml",
      },

      // Caesar salad @ Madrid
      {
        idMaterial: mid["Lettuce"],
        idTaskTemplate: tpl("Madrid apartment", "Caesar salad"),
        quantity: 1,
        unit: "ud",
      },
      {
        idMaterial: mid["Chicken"],
        idTaskTemplate: tpl("Madrid apartment", "Caesar salad"),
        quantity: 200,
        unit: "gr",
      },
      {
        idMaterial: mid["Croutons"],
        idTaskTemplate: tpl("Madrid apartment", "Caesar salad"),
        quantity: 50,
        unit: "gr",
      },
      {
        idMaterial: mid["Parmesan"],
        idTaskTemplate: tpl("Madrid apartment", "Caesar salad"),
        quantity: 20,
        unit: "gr",
      },

      // Buy bread @ Madrid
      {
        idMaterial: mid["Bread"],
        idTaskTemplate: tpl("Madrid apartment", "Buy bread"),
        quantity: 1,
        unit: "ud",
      },

      // Paella (simple) @ Our cozy house
      {
        idMaterial: mid["Rice"],
        idTaskTemplate: tpl("Our cozy house", "Paella (simple)"),
        quantity: 200,
        unit: "gr",
      },
      {
        idMaterial: mid["Chicken"],
        idTaskTemplate: tpl("Our cozy house", "Paella (simple)"),
        quantity: 300,
        unit: "gr",
      },
      {
        idMaterial: mid["Olive oil"],
        idTaskTemplate: tpl("Our cozy house", "Paella (simple)"),
        quantity: 40,
        unit: "ml",
      },
      {
        idMaterial: mid["Salt"],
        idTaskTemplate: tpl("Our cozy house", "Paella (simple)"),
        quantity: 5,
        unit: "gr",
      },

      // Spanish omelette (with onion)
      {
        idMaterial: mid["Potatoes"],
        idTaskTemplate: tpl("Our cozy house", "Spanish omelette (with onion)"),
        quantity: 300,
        unit: "gr",
      },
      {
        idMaterial: mid["Eggs"],
        idTaskTemplate: tpl("Our cozy house", "Spanish omelette (with onion)"),
        quantity: 4,
        unit: "ud",
      },
      {
        idMaterial: mid["Onion"],
        idTaskTemplate: tpl("Our cozy house", "Spanish omelette (with onion)"),
        quantity: 100,
        unit: "gr",
      },
      {
        idMaterial: mid["Olive oil"],
        idTaskTemplate: tpl("Our cozy house", "Spanish omelette (with onion)"),
        quantity: 50,
        unit: "ml",
      },

      // Deep-clean bathroom
      {
        idMaterial: mid["WC cleaner"],
        idTaskTemplate: tpl("Our cozy house", "Deep-clean bathroom"),
        quantity: 100,
        unit: "ml",
      },
      {
        idMaterial: mid["Toilet paper"],
        idTaskTemplate: tpl("Our cozy house", "Deep-clean bathroom"),
        quantity: 2,
        unit: "ud",
      },

      // Roast chicken dinner @ Madrid
      {
        idMaterial: mid["Whole chicken"],
        idTaskTemplate: tpl("Madrid apartment", "Roast chicken dinner"),
        quantity: 1,
        unit: "ud",
      },
      {
        idMaterial: mid["Garlic"],
        idTaskTemplate: tpl("Madrid apartment", "Roast chicken dinner"),
        quantity: 3,
        unit: "ud",
      },
      {
        idMaterial: mid["Paprika"],
        idTaskTemplate: tpl("Madrid apartment", "Roast chicken dinner"),
        quantity: 5,
        unit: "gr",
      },
      {
        idMaterial: mid["Olive oil"],
        idTaskTemplate: tpl("Madrid apartment", "Roast chicken dinner"),
        quantity: 30,
        unit: "ml",
      },
      {
        idMaterial: mid["Salt"],
        idTaskTemplate: tpl("Madrid apartment", "Roast chicken dinner"),
        quantity: 5,
        unit: "gr",
      },
      {
        idMaterial: mid["Black pepper"],
        idTaskTemplate: tpl("Madrid apartment", "Roast chicken dinner"),
        quantity: 2,
        unit: "gr",
      },
    ].map((x) => ({ ...x, createdAt: new Date(), updatedAt: new Date() }));

    await q.bulkInsert("materialtasktemplates", rows);
  },

  async down(q) {
    await q.bulkDelete("materialtasktemplates", null, {});
  },
};
