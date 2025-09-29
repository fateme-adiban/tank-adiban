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
