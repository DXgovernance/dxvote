import '@testing-library/jest-dom';
// import initializeI18Next from './src/i18n';
// initializeI18Next({ debug: false });

jest.mock('react-i18next', () => {
  return {
    __esModule: true,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
    withTranslation: () => (key: string) => key,
  };
});

