"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("users", {
      idUser: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: S.STRING(100), allowNull: false },
      email: { type: S.STRING(120), allowNull: false },
      username: { type: S.STRING(50), allowNull: false, unique: true },
      password: { type: S.STRING(100), allowNull: false },
      image: { type: S.TEXT, allowNull: true },
      color: { type: S.STRING(255), allowNull: false, defaultValue: "#ffffff" },
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
    await q.addIndex("users", ["email"]);
  },
  async down(q) {
    await q.dropTable("users");
  },
};
