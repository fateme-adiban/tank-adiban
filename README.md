# Setting up Jest with React Testing Library in a Next.js Project

## Step 1: Install the required dev dependencies

```bash
npm install -D @testing-library/jest-dom @testing-library/react @testing-library/user-event jest jest-environment-jsdom ts-jest
```

## Step 2: Create jest.config.js in the root of your project

```bash
const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./" // Path to your Next.js app
})

/** @type {import('jest').Config} */

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  }
}

module.exports = createJestConfig(customJestConfig)
```

## Step 3: Add test scripts to package.json

```bash
"test": "jest",
"test:watch": "jest --watchAll"
```

## Step 4: Create jest.setup.js in the root of your project

```bash
import "@testing-library/jest-dom/extend-expect"
```

## Step 5: Run this command to install the required packages

```bash
npm i -D eslint-plugin-jest-dom eslint-plugin-testing-library
```

## Step 6: Add the following to your eslint.config.mjs file

```bash
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:testing-library/react", "plugin:jest-dom/recommended"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
]
```

## Step 7: Create a folder named tests in the root of your project to store your test files.

## Step 8: Fix potential errors

If you encounter errors, try downgrading @testing-library/jest-dom to version 5.16.5:

```bash
npm install -D @testing-library/jest-dom@5.16.5
```

# Setting up a GitHub Action to check linting and type checking

## Step 1: Create the Workflow File

```bash
.github/workflows/test.yml
```

Add the following content:

```bash
name: Lint & Typecheck

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript typecheck
        run: npm run typecheck
```
