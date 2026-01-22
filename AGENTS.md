# Repository Guidelines

## Project Structure & Module Organization
This is a NestJS TypeScript backend. Core source code lives in `src/`, with feature modules under `src/modules/<feature>/` (e.g., `auth`, `user`, `cow`). Common helpers are in `src/common/` and `src/utils/`. Database migrations live in `src/database/migrations/`. Unit tests are typically colocated as `*.spec.ts` next to their modules; end‑to‑end tests live in `test/` (e.g., `test/app.e2e-spec.ts`). Build output goes to `dist/`.

## Build, Test, and Development Commands
Use pnpm for local workflows:
- `pnpm install` — install dependencies.
- `pnpm run start` — run the API in default mode.
- `pnpm run start:dev` — run with watch mode for development.
- `pnpm run build` — compile to `dist/`.
- `pnpm run lint` — run ESLint with auto-fix.
- `pnpm run format` — format `src/` and `test/` with Prettier.
- `pnpm run test`, `pnpm run test:watch`, `pnpm run test:cov` — Jest unit tests.
- `pnpm run test:e2e` — Jest e2e tests using `test/jest-e2e.json`.
- `pnpm run migration:generate|run|revert|create` — TypeORM migrations via `typeorm-cli.config.ts`.

## Coding Style & Naming Conventions
Follow Prettier and ESLint (see `.prettierrc` and `eslint.config.mjs`). Prettier enforces single quotes and trailing commas; use it instead of manual formatting. Files follow kebab-case naming (`cow-ownership-history.entity.ts`). Nest conventions apply: `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `*.entity.ts`, and DTOs in `dto/` as `*.dto.ts`.

## Testing Guidelines
Jest is configured in `package.json` with `*.spec.ts` for unit tests and `test/*.e2e-spec.ts` for e2e. Prefer colocated unit tests for modules, and keep e2e tests in `test/`. Run `pnpm run test` before PRs; use `pnpm run test:cov` when adding significant logic.

## Commit & Pull Request Guidelines
Recent commits use Conventional Commit style with a scope, e.g., `feat(user): add CRUD` or `feat(cow): add migrations`. Follow that pattern for new work (`feat`, `fix`, `chore`, etc.). No PR template is present; include a clear summary, list of tests run (e.g., `pnpm run test`), and link relevant issues or tickets.

## Security & Configuration Tips
Environment configuration is loaded from `.env` via `dotenv`. Do not commit secrets. Database changes should be captured as migrations in `src/database/migrations/` and applied using the migration scripts.
