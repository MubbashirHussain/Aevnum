# CONTRIBUTING.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Welcome to Aether Downloader Contributions

Aether Downloader is a stateless extraction utility built on Next.js 16. To maintain performance, clean monetization architectures, and code reliability, all contributors must align with the standards defined below.

---

## 1. Documentation Synchronization Policy

> [!IMPORTANT]
> **Documentation is a first-class citizen in this codebase.**  
> Any change to components, routing structure, state management patterns, environment variables, or backend integrations **MUST** be accompanied by updates to the corresponding `/docs/*.md` files within the **same pull request**.

Before committing, verify if your code adjustments require modifying:
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) (Adding/removing folders, routes, or files)
- [COMPONENTS.md](./COMPONENTS.md) (Editing props, local state hooks, or component linkages)
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) (Changing local storage structure, Zustand stores, or context contexts)
- [ROUTES.md](./ROUTES.md) (Modifying layout URLs or metadata variables)
- [ENVIRONMENT.md](./ENVIRONMENT.md) (Changing env variable structures)

---

## 2. General Code Guidelines

- **Stateless design consistency**: Do not write features that store or cache media assets on the local server. Any persistent parameters should remain within the client browser context.
- **Next.js Version Constraints**:
  - We compile on **Next.js 16**.
  - Respect the structural parameters shown in `AGENTS.md`.
  - Check deprecation logs before writing any custom API routes.
- **Styling Standards**:
  - Use **Tailwind CSS v4** classes.
  - Utilize HSL/zinc theme variables where possible; do not introduce ad-hoc color classes.
  - Synchronize styling configurations using the global `cn()` utility class compiler (`lib/utils.ts`).
- **TypeScript**:
  - Ensure all interfaces match API endpoints (see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)).
  - Run build tests locally before sending updates to validation branches.

---

## 3. Pull Request Protocol

1. **Branch Naming**:
   - Features: `feature/short-description`
   - Fixes: `bugfix/short-description`
   - Refactors/Docs: `chore/short-description`
2. **Local Validation**:
   - Ensure the app builds without errors: `npm run build`
   - Verify that all linter rules pass: `npm run lint`
3. **Commit Details**:
   - Ensure your commit messages clearly indicate if documentation has been synchronized alongside code updates.

*Related files: [`AGENTS.md`](../AGENTS.md), [`package.json`](../package.json), [`docs/README.md`](./README.md)*
