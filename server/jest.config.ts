import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  testTimeout: 30000,
  setupFiles: ["<rootDir>/src/tests/env.ts"],
};

export default config;
