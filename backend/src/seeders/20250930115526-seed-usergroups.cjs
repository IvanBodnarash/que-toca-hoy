"use strict";

module.exports = {
  async up(q) {
    const [users] = await q.sequelize.query(
      'SELECT "idUser","username" FROM "users" ORDER BY "idUser"'
    );
    const [groups] = await q.sequelize.query(
      'SELECT "idGroup","name" FROM "groups" ORDER BY "idGroup"'
    );

    const U = users;
    const G = Object.fromEntries(groups.map((g) => [g.name, g.idGroup]));

    const rows = [
      // Barcelona apartment
      { idUser: U[0].idUser, idGroup: G["Barcelona apartment"] },
      { idUser: U[1].idUser, idGroup: G["Barcelona apartment"] },

      // Madrid apartment
      { idUser: U[2].idUser, idGroup: G["Madrid apartment"] },
      { idUser: U[3].idUser, idGroup: G["Madrid apartment"] },

      // Our cozy house
      { idUser: U[4].idUser, idGroup: G["Our cozy house"] },
      { idUser: U[5].idUser, idGroup: G["Our cozy house"] },
      { idUser: U[6].idUser, idGroup: G["Our cozy house"] },
      { idUser: U[7].idUser, idGroup: G["Our cozy house"] },
    ].map((x) => ({ ...x, createdAt: new Date(), updatedAt: new Date() }));

    await q.bulkInsert("usergroups", rows);
  },

  async down(q) {
    await q.bulkDelete("usergroups", null, {});
  },
};
