"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("usergroups", {
      idUserGroup: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idUser: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "users", key: "idUser" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      idGroup: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "groups", key: "idGroup" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
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
    await q.dropTable("usergroups");
  },
};
