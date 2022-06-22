export default {
    verbose: true,
    roots: ['<rootDir>'],
    testMatch: ['**/*.spec.ts', '**/*.test.ts'],
    clearMocks: true,
    coverageProvider: 'v8',
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
    setupFiles: ['./test/setupBeforeEnv.ts'],
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleFileExtensions: ['ts', 'js', 'json', 'd.ts'],
};
