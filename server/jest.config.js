/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  testTimeout: 30000,
  setupFiles: ["<rootDir>/src/tests/env.ts"],
};
