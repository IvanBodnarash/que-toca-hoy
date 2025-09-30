"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(q) {
    const rows = [
      {
        name: "Ana Torres",
        email: "ana@example.com",
        username: "ana",
        password: await bcrypt.hash("123456", 10),
      },
      {
        name: "Juan Pérez",
        email: "juan@example.com",
        username: "juan",
        password: await bcrypt.hash("123456", 10),
      },
      {
        name: "Marta López",
        email: "marta@example.com",
        username: "marta",
        password: await bcrypt.hash("123456", 10),
      },
      {
        name: "Sergio Martínez",
        email: "sergio@example.com",
        username: "sergio",
        password: await bcrypt.hash("123456", 10),
      },
      {
        name: "Antonny",
        email: "antonny@example.com",
        username: "antonny",
        password: await bcrypt.hash("123456", 10),
        color: "#000000",
        image:
          "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/007.png",
      },
      {
        name: "Elena",
        email: "elena@example.com",
        username: "elena",
        password: await bcrypt.hash("123456", 10),
        color: "#FFBC42",
        image:
          "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/172.png",
      },
      {
        name: "Gerard",
        email: "gerard@example.com",
        username: "gerard",
        password: await bcrypt.hash("123456", 10),
        color: "#444741",
        image:
          "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/133.png",
      },
      {
        name: "Ivan",
        email: "ivan@example.com",
        username: "ivan",
        password: await bcrypt.hash("123456", 10),
        color: "#266AB6",
        image:
          "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/018.png",
      },
    ].map((x) => ({
      ...x,
      color: x.color ?? "#ffffff",
      image: x.image ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await q.bulkInsert("users", rows);
  },

  async down(q) {
    await q.bulkDelete("users", null, {});
  },
};
