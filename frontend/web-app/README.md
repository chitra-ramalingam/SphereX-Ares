# React + TypeScript + Vite

## SPHEREx backend integration

The UI calls the Python service through `VITE_API_BASE_URL`. For local
development, leave it unset and run the API on `http://127.0.0.1:8000`; Vite
proxies `/api` automatically.

For Vercel, add this project environment variable for Production, Preview, and
Development:

```text
VITE_API_BASE_URL=https://your-deployed-backend.example.com
```

The value must be the backend origin only, with no trailing `/api`. The backend
must expose `/api/health`, `/api/targets`, and the other routes implemented in
`backend/src/spherex/api_server.py`.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
