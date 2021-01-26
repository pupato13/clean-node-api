module.exports = {
    roots: ["<rootDir>/src"],
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!/src/main/**",
        "!/src/**/*-protocols.ts",
        "!/src/**/signup-protocols.ts",
        "!**/protocols/**",
        "!**/test/**",
    ],
    coveragePathIgnorePatterns: [
        "<rootDir>/src/presentation/controllers/signup/signup-protocols.ts",
        "<rootDir>/src/data/usecases/add-account/db-add-account-protocols.ts",
    ],
    coverageDirectory: "coverage",
    testEnvironment: "node",
    transform: {
        ".+\\.ts$": "ts-jest",
    },
};
