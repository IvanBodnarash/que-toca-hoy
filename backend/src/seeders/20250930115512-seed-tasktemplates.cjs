"use strict";

module.exports = {
  async up(q) {
    // get groups by name
    const [groups] = await q.sequelize.query(
      'SELECT "idGroup","name" FROM "groups"'
    );
    const gid = Object.fromEntries(groups.map((g) => [g.name, g.idGroup]));

    const rows = [
      // Group: Barcelona apartment
      {
        name: "Clean kitchen",
        steps: JSON.stringify([
          "Sweep floor",
          "Mop floor",
          "Organize countertop",
        ]),
        idGroup: gid["Barcelona apartment"],
        type: "task",
      },
      {
        name: "Take out trash",
        steps: JSON.stringify([
          "Collect organic waste",
          "Collect plastics",
          "Collect paper",
          "Bring to container",
        ]),
        idGroup: gid["Barcelona apartment"],
        type: "task",
      },
      {
        name: "Paella (chicken)",
        steps: JSON.stringify([
          "Fry chicken",
          "Add rice",
          "Add vegetables",
          "Pour in broth",
        ]),
        idGroup: gid["Barcelona apartment"],
        type: "recipe",
      },
      {
        name: "Spanish omelette",
        steps: JSON.stringify([
          "Slice potatoes",
          "Fry potatoes",
          "Beat eggs",
          "Combine and set",
        ]),
        idGroup: gid["Barcelona apartment"],
        type: "recipe",
      },
      {
        name: "Vacuum living room",
        steps: JSON.stringify([
          "Plug in vacuum",
          "Vacuum carpet",
          "Empty dust container",
        ]),
        idGroup: gid["Barcelona apartment"],
        type: "task",
      },

      // Group: Madrid apartment
      {
        name: "Clean bathroom",
        steps: JSON.stringify([
          "Mop floor",
          "Clean mirror",
          "Disinfect toilet",
        ]),
        idGroup: gid["Madrid apartment"],
        type: "task",
      },
      {
        name: "Buy bread",
        steps: JSON.stringify(["Go to bakery", "Choose a loaf", "Pay"]),
        idGroup: gid["Madrid apartment"],
        type: "task",
      },
      {
        name: "Caesar salad",
        steps: JSON.stringify([
          "Wash lettuce",
          "Slice chicken",
          "Add croutons",
          "Dress and toss",
        ]),
        idGroup: gid["Madrid apartment"],
        type: "recipe",
      },
      {
        name: "Weekly groceries",
        steps: JSON.stringify([
          "Check pantry",
          "Write list",
          "Shop essentials",
        ]),
        idGroup: gid["Madrid apartment"],
        type: "task",
      },
      {
        name: "Roast chicken dinner",
        steps: JSON.stringify([
          "Season chicken",
          "Roast in oven",
          "Rest and carve",
          "Serve with sides",
        ]),
        idGroup: gid["Madrid apartment"],
        type: "recipe",
      },

      // Group: Our cozy house
      {
        name: "Deep-clean bathroom",
        steps: JSON.stringify([
          "Remove items",
          "Apply cleaner",
          "Scrub all surfaces",
          "Dry surfaces",
        ]),
        idGroup: gid["Our cozy house"],
        type: "task",
      },
      {
        name: "Wipe kitchen surfaces",
        steps: JSON.stringify(["Wipe countertops", "Mop floor"]),
        idGroup: gid["Our cozy house"],
        type: "task",
      },
      {
        name: "Wash dishes",
        steps: JSON.stringify([
          "Fill sink",
          "Apply dish soap",
          "Scrub",
          "Rinse",
        ]),
        idGroup: gid["Our cozy house"],
        type: "task",
      },
      {
        name: "Vacuum bedrooms",
        steps: JSON.stringify(["Plug in vacuum", "Vacuum each room"]),
        idGroup: gid["Our cozy house"],
        type: "task",
      },
      {
        name: "Take out garbage",
        steps: JSON.stringify(["Collect bags", "Bring to container"]),
        idGroup: gid["Our cozy house"],
        type: "task",
      },
      {
        name: "Paella (simple)",
        steps: JSON.stringify([
          "Prep ingredients",
          "Sauté base",
          "Cook rice",
          "Rest before serving",
        ]),
        idGroup: gid["Our cozy house"],
        type: "recipe",
      },
      {
        name: "Spanish omelette (with onion)",
        steps: JSON.stringify([
          "Peel potatoes",
          "Fry potatoes",
          "Beat eggs",
          "Mix with onion and cook",
        ]),
        idGroup: gid["Our cozy house"],
        type: "recipe",
      },
      {
        name: "Cuban-style rice",
        steps: JSON.stringify([
          "Cook rice",
          "Fry eggs",
          "Serve with tomato sauce",
        ]),
        idGroup: gid["Our cozy house"],
        type: "recipe",
      },
    ];

    await q.bulkInsert("tasktemplates", rows);
  },

  async down(q) {
    await q.bulkDelete("tasktemplates", null, {});
  },
};
