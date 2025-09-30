"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("tasktemplates", {
      idTaskTemplate: {
        type: S.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: S.STRING, allowNull: false },
      steps: { type: S.JSON, allowNull: false },
      idGroup: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "groups", key: "idGroup" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      type: {
        type: S.ENUM("task", "recipe"),
        allowNull: false,
        defaultValue: "task",
      },
    });
  },
  async down(q) {
    await q.dropTable("tasktemplates");
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_tasktemplates_type";');
  },
};
