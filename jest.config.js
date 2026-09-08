module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // sdk 57 keeps expo-modules-core nested under expo/ rather than hoisted, but
  // jest-expo's preset resolves it from the project root, so give jest the nested
  // folder as a second place to look
  moduleDirectories: ['node_modules', 'node_modules/expo/node_modules'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
};
