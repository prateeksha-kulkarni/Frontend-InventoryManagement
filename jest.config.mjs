export default {
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/_mocks_/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
};
