"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("usertasks", {
      idUserTask: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idUser: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "users", key: "idUser" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      idTaskDated: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "tasksdated", key: "idTaskDated" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: S.ENUM("todo", "done"),
        allowNull: false,
        defaultValue: "todo",
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

    await q.addConstraint("usertasks", {
      fields: ["idUser", "idTaskDated"],
      type: "unique",
      name: "usertasks_iduser_idtaskdated_unique",
    });
  },
  async down(q) {
    await q.removeConstraint(
      "usertasks",
      "usertasks_iduser_idtaskdated_unique"
    );
    await q.dropTable("usertasks");
    await q.sequelize.query('DROP TYPE IF EXISTS "enum_usertasks_status";');
  },
};
