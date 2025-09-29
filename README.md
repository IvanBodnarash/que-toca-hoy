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
