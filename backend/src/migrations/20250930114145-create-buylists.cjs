"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("buylists", {
      idBuyList: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idTaskDated: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "tasksdated", key: "idTaskDated" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      idMaterial: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "materials", key: "idMaterial" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      quantity: { type: S.FLOAT, allowNull: false },
      unit: {
        type: S.ENUM("ud", "ml", "gr"),
        allowNull: false,
        defaultValue: "ud",
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
    await q.dropTable("buylists");
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_buylists_unit";');
  },
};
