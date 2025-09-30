"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("groups", {
      idGroup: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: S.STRING(100), allowNull: false },
      pin: { type: S.TEXT, allowNull: true },
      pinEncrypted: { type: S.TEXT, allowNull: true },
      image: { type: S.TEXT, allowNull: true },
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
    await q.dropTable("groups");
  },
};
