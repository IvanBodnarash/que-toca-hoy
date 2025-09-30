```bash
npm i pg pg-hstore            # drivers for Postgres
npm i -D sequelize-cli        # CLI for migrations/seeds
```

## Stages

- Adding new brief info feature to the Home page with todo and done tasks for current user

  - Backend logic tweaking + refactoring
  - New components on frontend with services refactoring

- Import recipes from [Recipe Compass](https://the-recipe-compass.web.app/)

  - Adding config with .env variables (temporarily, in production must be configured through Vercel)
  - Creating new modal component + tweaking RecipePage
  - Special data parser to prepare data for importing from RecipeCompass to this app (ingredients) - `ingredientParser.js`

- Implementing websocket (Socket IO) for realtime content updating

  - Backend updating
  - Adding hooks, helpers and provider (`RealtimeProvider.jsx`, `socket.js`, `useCalendarRealtime.js`, `useGroupRealtime.js`) on frontend

- Adding initial landing page with brief info about app features

  - Changing route structure (from "/" to "/app")
  - UI/UX (layout: header with branding + links) + hero with info about the application and buttons for entering (register or login)
  - Adding carousel of features to landing page

- Refactoring and bug fixing

  - Fixed a bug with task template editing
  - Fixed a token refresh bug (finally)

- Migration to Postgress (Neon)

  1. Remove autosync & inline seeds

  - Removed sequelize.sync(...) and the whole seedIfEmpty() from src/app.js. Schema & demo data are controlled by migrations/seeders now.

  2. Init structure for migrations/seeders

  ```bash
  npm i pg pg-hstore
  npm i -D sequelize-cli
  npx sequelize-cli init
  ```

  - Keep CLI artifacts but map them to src/ with .sequelizerc:

  ```js
  // backend/.sequelizerc
  const path = require("path");
  module.exports = {
    config: path.resolve(__dirname, "config", "config.cjs"),
    "migrations-path": path.resolve(__dirname, "src", "migrations"),
    "seeders-path": path.resolve(__dirname, "src", "seeders"),
  };
  ```

  - CLI expects CommonJS files -> migrations/seeders should be with .cjs extention and export module.exports = { up, down }.

  3. Database config

  - `config/config.cjs`

  ```js
  require("dotenv").config();
  module.exports = {
    development: {
      url: process.env.DATABASE_URL,
      dialect: "postgres",
      dialectOptions: { ssl: { require: true } },
      logging: console.log,
    },
    production: {
      url: process.env.DATABASE_URL,
      dialect: "postgres",
      dialectOptions: { ssl: { require: true } },
      logging: false,
    },
  };
  ```

  - Runtime connection (`config/database.js`) using DATABASE_URL (Neon), otherwise could fall back into local MySQL:

  ```js
  import "dotenv/config";
  import { Sequelize } from "sequelize";

  const usePg = !!process.env.DATABASE_URL;

  export const sequelize = usePg
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: { ssl: { require: true } },
        logging: process.env.NODE_ENV !== "production" ? console.log : false,
        pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
      })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_USE_PWD !== "false" ? process.env.DB_PASS : undefined,
        {
          host: process.env.DB_HOST,
          dialect: "mysql",
          port: process.env.DB_PORT || 3306,
          logging: process.env.NODE_ENV !== "production" ? console.log : false,
          pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
        }
      );
  ```

  4. .env / .env.example / .gitignore

  - Neon pooled connection string (with `?sslmode=require`):

  ```
  DATABASE_URL=postgres://USER:PASSWORD@ep-xxxxxx-pooler.eu-central-1.aws.neon.tech/DBNAME?sslmode=require
  ```

  5. Model tweaks for Postgres

  - Changed MySQL-type: UNSIGNED, TEXT('long') -> basic INTEGER, TEXT.

  - In TaskTemplate timestamps: false

  6. Migrations (schema)

  - Created 10 migrations (in this order):
    users -> groups -> materials -> tasktemplates -> tasksdated -> usergroups -> usertasks -> materialtasktemplates -> buylists -> userrefresh.

  7. Seeders (demo data)

  - All seeds: users, groups, materials, tasktemplates, usergroups, tasksdated, materialtasktemplates, buylists, usertasks.

  - For users added color default, to prevent NOT NULL:

    ```js
    color: x.color ?? "#ffffff";
    ```

  - Dates in tasksdated - fixed ISO, so that other seeds can reference them.

  8. Running DB updates

  ```bash
    # run all migrations

    npx sequelize-cli db:migrate

    # run all seeders

    npx sequelize-cli db:seed:all
  ```

9. Start backend (local, against Neon)

```bash
npm start

# or with auto-reload

npm run dev
```

10. package.json scripts

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "reset:db": "sequelize-cli db:seed:undo:all && sequelize-cli db:migrate:undo:all && sequelize-cli db:migrate && sequelize-cli db:seed:all"
  }
}
```

11. Neon setup (once)

- Provider: AWS, Region: EU (Frankfurt), Postgres 17.

- In Neon -> Connect -> copy Pooled connection string -> paste in .env as DATABASE_URL.
