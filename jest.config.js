module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]s?$": ["ts-jest", {
      useESM: true
    }]
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
