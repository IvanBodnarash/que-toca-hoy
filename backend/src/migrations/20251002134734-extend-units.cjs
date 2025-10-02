"use strict";

module.exports = {
  // THIS MIGRATION IS ONLY RUNNING ON POSTGRES
  async up(queryInterface) {
    if (queryInterface.sequelize.getDialect() !== "postgres") return;

    // Add new values, but only if they don't exist yet
    const addValues = async (typeName, values) => {
      for (const v of values) {
        await queryInterface.sequelize.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM pg_type t
              JOIN pg_enum e ON e.enumtypid = t.oid
              WHERE t.typname='${typeName}' AND e.enumlabel='${v}'
            ) THEN
              ALTER TYPE "${typeName}" ADD VALUE '${v}';
            END IF;
          END$$;
        `);
      }
    };

    const extras = [
      "kg",
      "l",
      "tsp",
      "tbsp",
      "cup",
      "pint",
      "pinch",
      "dash",
      "clove",
      "bunch",
      "slice",
      "handful",
      "can",
      "pack",
      "piece",
    ];

    // Type names confirmed by your error and schema:
    // enum_materialtasktemplates_unit та enum_buylists_unit
    await addValues("enum_materialtasktemplates_unit", extras);
    await addValues("enum_buylists_unit", extras);
  },

  async down() {
    // Deleting values ​​from a Postgres ENUM is difficult; usually down is empty here.
  },

  // To avoid "ALTER TYPE ... inside a transaction"
  // (sometimes needed for older versions of PG/conditions)
  useTransaction: false,
};
