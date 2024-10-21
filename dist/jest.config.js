"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts?$': ['ts-jest', {
                tsconfig: 'tsconfig.json', // Path to your TypeScript config
                // Additional ts-jest options can be added here if needed
            }],
    },
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/tests/**/*.test.ts'], // Adjust this if your tests are in a different directory
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map