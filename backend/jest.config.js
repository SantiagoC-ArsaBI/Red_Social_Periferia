module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  roots: [
    '<rootDir>/services/auth-service',
    '<rootDir>/services/user-service',
    '<rootDir>/services/post-service',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/services/auth-service/src/$1',
  },
};
