# Contributing to Shoebox Webapp

Thanks for your interest in contributing! This document covers how to get started.

## Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/deepjoy/shoebox-webapp.git
   cd shoebox-webapp
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

   This also installs [Lefthook](https://github.com/evilmartians/lefthook) git hooks via the `prepare` script.

3. **Start the dev server:**

   ```bash
   pnpm dev
   ```

## Project Structure

This is a pnpm monorepo:

```
packages/
  api/        # TypeScript SDK for S3-compatible APIs
  app/        # React SPA
  tsconfig/   # Shared TypeScript configurations
  lint/       # Shared linting rules
```

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must follow this format:

```
<type>(<scope>): <description>

[optional body]
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.

Scopes match the package names: `api`, `app`, or omit for repo-wide changes.

Examples:

```
feat(app): add dark mode toggle
fix(api): handle empty XML responses
chore: update dependencies
```

## Pull Requests

1. Fork the repository and create a branch from `main`.
2. Make your changes and ensure they pass the pre-commit hooks.
3. Run `pnpm build` to verify the build succeeds.
4. Open a pull request against `main`.

## Code Style

Formatting and linting are handled by [oxfmt](https://oxc.rs/) and [oxlint](https://oxc.rs/):

```bash
pnpm fmt        # Format code
pnpm fmt:check  # Check formatting
pnpm lint       # Lint code
```

Pre-commit hooks run these automatically on staged files.

## Reporting Issues

- **Bugs:** Use the [bug report template](https://github.com/deepjoy/shoebox-webapp/issues/new?template=bug_report.yml).
- **Features:** Use the [feature request template](https://github.com/deepjoy/shoebox-webapp/issues/new?template=feature_request.yml).
- **Security:** See [SECURITY.md](SECURITY.md).
