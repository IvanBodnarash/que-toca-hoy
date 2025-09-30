"use strict";

module.exports = {
  async up(q) {
    const [groups] = await q.sequelize.query(
      'SELECT "idGroup","name" FROM "groups"'
    );
    const [tt] = await q.sequelize.query(
      'SELECT "idTaskTemplate","name","idGroup" FROM "tasktemplates"'
    );

    const gid = Object.fromEntries(groups.map((g) => [g.name, g.idGroup]));
    const findTpl = (groupName, templateName) =>
      tt.find((t) => t.idGroup === gid[groupName] && t.name === templateName)
        .idTaskTemplate;

    // Фіксовані дати (UTC)
    const d = (s, addHours = 0) =>
      new Date(new Date(s).getTime() + addHours * 3600 * 1000);

    const rows = [
      // Group: Barcelona apartment
      {
        idGroup: gid["Barcelona apartment"],
        idTaskTemplate: findTpl("Barcelona apartment", "Clean kitchen"),
        startDate: d("2025-09-01T10:00:00Z"),
        endDate: d("2025-09-01T12:00:00Z"),
        status: "todo",
        frequency: "daily",
        rotative: true,
      },

      {
        idGroup: gid["Barcelona apartment"],
        idTaskTemplate: findTpl("Barcelona apartment", "Paella (chicken)"),
        startDate: d("2025-09-01T11:00:00Z"),
        endDate: d("2025-09-01T14:00:00Z"),
        status: "todo",
        frequency: "weekly",
        rotative: false,
      },

      // Group: Madrid apartment
      {
        idGroup: gid["Madrid apartment"],
        idTaskTemplate: findTpl("Madrid apartment", "Clean bathroom"),
        startDate: d("2025-09-02T09:00:00Z"),
        endDate: d("2025-09-02T10:30:00Z"),
        status: "done",
        frequency: "monthly",
        rotative: true,
      },

      {
        idGroup: gid["Madrid apartment"],
        idTaskTemplate: findTpl("Madrid apartment", "Caesar salad"),
        startDate: d("2025-09-02T12:00:00Z"),
        endDate: d("2025-09-02T13:00:00Z"),
        status: "todo",
        frequency: "weekly",
        rotative: false,
      },

      // Back to Barcelona
      {
        idGroup: gid["Barcelona apartment"],
        idTaskTemplate: findTpl("Barcelona apartment", "Vacuum living room"),
        startDate: d("2025-09-03T08:00:00Z"),
        endDate: d("2025-09-03T08:45:00Z"),
        status: "done",
        frequency: "daily",
        rotative: true,
      },

      // Group: Madrid apartment
      {
        idGroup: gid["Madrid apartment"],
        idTaskTemplate: findTpl("Madrid apartment", "Buy bread"),
        startDate: d("2025-09-03T09:00:00Z"),
        endDate: d("2025-09-03T09:30:00Z"),
        status: "todo",
        frequency: "daily",
        rotative: false,
      },

      // Group: Our cozy house (rotations)
      {
        idGroup: gid["Our cozy house"],
        idTaskTemplate: findTpl("Our cozy house", "Deep-clean bathroom"),
        startDate: d("2025-08-18T00:00:01Z"),
        endDate: d("2025-08-24T23:59:59Z"),
        status: "done",
        frequency: "weekly",
        rotative: true,
      },

      {
        idGroup: gid["Our cozy house"],
        idTaskTemplate: findTpl("Our cozy house", "Wipe kitchen surfaces"),
        startDate: d("2025-08-25T00:00:01Z"),
        endDate: d("2025-08-31T23:59:59Z"),
        status: "todo",
        frequency: "weekly",
        rotative: true,
      },

      {
        idGroup: gid["Our cozy house"],
        idTaskTemplate: findTpl("Our cozy house", "Wash dishes"),
        startDate: d("2025-09-01T00:00:01Z"),
        endDate: d("2025-09-07T23:59:59Z"),
        status: "done",
        frequency: "weekly",
        rotative: true,
      },

      {
        idGroup: gid["Our cozy house"],
        idTaskTemplate: findTpl("Our cozy house", "Vacuum bedrooms"),
        startDate: d("2025-08-25T00:00:01Z"),
        endDate: d("2025-08-31T23:59:59Z"),
        status: "todo",
        frequency: "weekly",
        rotative: true,
      },

      {
        idGroup: gid["Our cozy house"],
        idTaskTemplate: findTpl("Our cozy house", "Take out garbage"),
        startDate: d("2025-09-01T00:00:01Z"),
        endDate: d("2025-09-01T23:59:59Z"),
        status: "todo",
        frequency: "daily",
        rotative: true,
      },

      {
        idGroup: gid["Our cozy house"],
        idTaskTemplate: findTpl("Our cozy house", "Cuban-style rice"),
        startDate: d("2025-09-04T00:00:01Z"),
        endDate: d("2025-09-04T23:59:59Z"),
        status: "todo",
        frequency: "none",
        rotative: false,
      },
    ].map((x) => ({ ...x, createdAt: new Date(), updatedAt: new Date() }));

    await q.bulkInsert("tasksdated", rows);
  },

  async down(q) {
    await q.bulkDelete("tasksdated", null, {});
  },
};
