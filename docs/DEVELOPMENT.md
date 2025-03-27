# Nextshop Development Workflow Guide

This document provides detailed instructions for the Nextshop development workflow, including local setup, development practices, and deployment procedures.

## Development Environment

### Prerequisites

- Node.js 18.18.0 or higher (specified in `.nvmrc`)
- npm 8.0.0 or higher
- Git and Git LFS

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hazenbox/Nextshop.git
   cd Nextshop
   ```

2. **Use the correct Node.js version**
   ```bash
   # Using nvm (Node Version Manager)
   nvm use
   ```

3. **Install dependencies**
   ```bash
   npm install
   # If you encounter dependency issues
   npm run reinstall
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials or set VITE_DEV_MODE=true
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Development Modes

### Production Mode

When `VITE_DEV_MODE=false` or not set in `.env`:
- Connects to actual Supabase backend
- Requires valid Supabase API credentials
- Uses real authentication and database operations

### Development Mode

When `VITE_DEV_MODE=true` in `.env`:
- Uses mock data instead of API calls
- Simulates authentication flow
- Allows development without a Supabase account
- Provides quick testing and UI development

## Development Container / GitHub Codespaces

For consistent development environments, we support VS Code Dev Containers and GitHub Codespaces:

1. In GitHub: Click the "Code" button and select "Open with Codespaces"
2. In VS Code: Install the Dev Containers extension, press F1 and select "Dev Containers: Open Folder in Container"

The container includes:
- Node.js 18.18.0
- All required development tools
- Pre-configured VS Code extensions
- Automatic handling of dependencies

## Git Workflow

### Branch Strategy

- `main`: Production-ready code, deployed to GitHub Pages
- `develop`: Integration branch for features, bugfixes
- Feature branches: `feature/name-of-feature`
- Bugfix branches: `fix/name-of-fix`

### Commit Conventions

Follow conventional commits:
```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting, missing semicolons
refactor: code change that neither fixes a bug nor adds a feature
test: adding tests
chore: updating build tasks, package manager configs
```

### Pull Request Process

1. Create a branch from `develop`
2. Make your changes
3. Ensure code passes linting and builds successfully
4. Submit a PR to merge into `develop`
5. Request code review from maintainers
6. After approval, merge into `develop`

## CI/CD Pipeline

Our GitHub Actions workflow automates:

1. **Continuous Integration**
   - Runs on each PR to `develop` and `main`
   - Verifies code quality with ESLint
   - Builds the application to ensure it compiles

2. **Continuous Deployment**
   - Triggers on merges to `main`
   - Builds the application
   - Deploys to GitHub Pages

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check for issues
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run clean` - Remove build artifacts and dependencies
- `npm run reinstall` - Clean and reinstall dependencies
- `npm run deploy` - Manual deploy to GitHub Pages

## Troubleshooting

### Node.js Version Issues

If you encounter errors related to Node.js compatibility:
1. Update Node.js to version 18.18.0+
2. Run `nvm use` if you use nvm
3. Run `npm run reinstall` to clean and reinstall dependencies

### Build Errors

For Rollup or other build errors:
1. Try `npm run clean` to remove build artifacts
2. Run `npm run reinstall` to reinstall dependencies
3. Check error logs for specific issues

### ESLint Errors

1. Run `npm run lint:fix` to automatically fix most issues
2. For persistent errors, check the specific error and file location
3. Consider adding specific rule exceptions in .eslintrc.json for edge cases

## Deployment

For manual deployment:
1. Ensure you have pushed your changes to GitHub
2. Run `npm run deploy`
3. Check that the deployment was successful by visiting https://hazenbox.github.io/Nextshop

For automatic deployment:
1. Merge your changes to the `main` branch
2. GitHub Actions will handle the deployment
3. Monitor the Actions tab for deployment status 