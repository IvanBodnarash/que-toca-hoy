"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("materials", {
      idMaterial: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: S.STRING(100), allowNull: false },
      assumed: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: {
        type: S.DATE,
        allowNull: false,
        defaultValue: S.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: S.DATE,
        allowNull: false,
        defaultValue: S.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(q) {
    await q.dropTable("materials");
  },
};
