module.exports = {
  'src/**/*.{ts,tsx,json}': [
    'yarn run format',
    'yarn run lint --fix',
    // TODO: consider adding tests later if neccesary
    'yarn run test --bail --findRelatedTests',
  ],
};

