"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("tasksdated", {
      idTaskDated: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idGroup: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "groups", key: "idGroup" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      idTaskTemplate: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "tasktemplates", key: "idTaskTemplate" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      startDate: { type: S.DATE, allowNull: false },
      endDate: { type: S.DATE, allowNull: false },
      status: {
        type: S.ENUM("done", "todo"),
        allowNull: false,
        defaultValue: "todo",
      },
      frequency: {
        type: S.ENUM("none", "daily", "weekly", "monthly"),
        allowNull: false,
        defaultValue: "none",
      },
      rotative: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
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
    await q.dropTable("tasksdated");
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_tasksdated_status";');
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_tasksdated_frequency";');
  },
};
