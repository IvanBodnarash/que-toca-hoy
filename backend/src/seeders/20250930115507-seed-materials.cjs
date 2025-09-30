"use strict";

module.exports = {
  async up(q) {
    const names = [
      "Rice",
      "Chicken",
      "Tomato",
      "Potatoes",
      "Eggs",
      "Dish soap",
      "Toilet paper",
      "Lettuce",
      "Croutons",
      "Bread",
      "Olive oil",
      "Onion",
      "WC cleaner",
      "Tomato sauce",
      "Salt",
      "Black pepper",
      "Garlic",
      "Paprika",
      "Parmesan",
      "Whole chicken",
    ];
    const rows = names.map((n) => ({
      name: n,
      assumed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await q.bulkInsert("materials", rows);
  },

  async down(q) {
    await q.bulkDelete("materials", null, {});
  },
};
