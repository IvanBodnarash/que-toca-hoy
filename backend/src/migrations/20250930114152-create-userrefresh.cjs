"use strict";

module.exports = {
  async up(q, S) {
    await q.createTable("userrefresh", {
      idUserRefresh: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idUser: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "users", key: "idUser" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      refreshToken: { type: S.TEXT, allowNull: false },
      expiresAt: { type: S.DATE, allowNull: false },
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

    await q.addIndex("userrefresh", ["refreshToken"], {
      name: "userrefresh_refreshtoken_idx",
    });
    await q.addIndex("userrefresh", ["idUser"], {
      name: "userrefresh_iduser_idx",
    });
  },
  async down(q) {
    await q.removeIndex("userrefresh", "userrefresh_refreshtoken_idx");
    await q.removeIndex("userrefresh", "userrefresh_iduser_idx");
    await q.dropTable("userrefresh");
  },
};
