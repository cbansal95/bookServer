/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },
  clearMocks: true,
  coverageProvider: "v8",
  preset: 'ts-jest',
  testEnvironment: 'node',
  //setupFilesAfterEnv: ['<rootDir>/src/singleton.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: [
             "**/?(*.)+(spec|test).[j]s?(x)"
         ]
};

export default config;
