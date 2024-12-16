module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json'],
  transform: {},  // Since we're using CommonJS, we don't need transforms
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '../functions/create-checkout-session.js'
  ],
  moduleNameMapper: {
    // Add any module name mappings if needed
  },
  setupFiles: ['./jest.setup.js']
}
