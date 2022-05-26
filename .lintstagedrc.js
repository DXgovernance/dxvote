module.exports = {
  'src/**/*.{ts,tsx,json}': [
    'yarn run format',
    'yarn run lint --fix',
    'yarn run test --bail --findRelatedTests',
  ],
};

