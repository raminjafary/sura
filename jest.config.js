module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'test/coverage',
  testMatch: ['**/tests/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
}
