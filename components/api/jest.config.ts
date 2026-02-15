import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "cobertura"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/db/index.ts",
    "!src/**/__tests__/**",
  ],
};

export default config;
