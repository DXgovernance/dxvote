import React, { useEffect } from 'react';
import {
    createGlobalStyle,
    css,
    ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components';
import { useStores } from '../contexts/storesContext';

export const SUPPORTED_THEMES = {
    DARK: 'DARK',
    LIGHT: 'LIGHT',
};

const MEDIA_WIDTHS = {
    upToSmall: 600,
    upToMedium: 960,
    upToLarge: 1280,
};

const mediaWidthTemplates = Object.keys(MEDIA_WIDTHS).reduce(
    (accumulator, size) => {
        accumulator[size] = (...args) => css`
            @media (max-width: ${MEDIA_WIDTHS[size]}px) {
                ${css(...args)}
            }
        `;
        return accumulator;
    },
    {}
);

const white = '#FFFFFF';
const black = '#000000';

export default function ThemeProvider({ children }) {
    const {
        root: { configStore },
    } = useStores();

    const darkMode = configStore.darkMode;

    useEffect(() => {
        configStore.setDarkMode(darkMode);
    }, [configStore, darkMode]);
    return (
        <StyledComponentsThemeProvider theme={theme(darkMode)}>
          {children}
        </StyledComponentsThemeProvider>
    );
}

const theme = (darkMode) => ({
    white,
    black,
    textColor: darkMode ? white : '#010101',
    greyText: darkMode ? white : '#6C7284',

    // for setting css on <html>
    backgroundColor: darkMode ? '#333639' : white,
    
    activeButtonBackground: "#536DFE",

    modalBackground: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
    inputBackground: darkMode ? '#202124' : white,
    placeholderGray: darkMode ? '#5F5F5F' : '#E1E1E1',
    shadowColor: darkMode ? '#000' : '#2F80ED',
    
    borderStyle: "rgba(14, 0, 135, 0.1) 0px 2px 10px, rgba(14, 0, 135, 0.05) 0px 12px 32px",

    // grays
    concreteGray: darkMode ? '#292C2F' : '#FAFAFA',
    mercuryGray: darkMode ? '#333333' : '#E1E1E1',
    silverGray: darkMode ? '#737373' : '#C4C4C4',
    chaliceGray: darkMode ? '#7B7B7B' : '#AEAEAE',
    doveGray: darkMode ? '#C4C4C4' : '#737373',
    mineshaftGray: darkMode ? '#E1E1E1' : '#2B2B2B',
    activeGray: darkMode ? '#292C2F' : '#F7F8FA',
    buttonOutlineGrey: darkMode ? '#FAFAFA' : '#F2F2F2',
    tokenRowHover: darkMode ? '#404040' : '#F2F2F2',

    //blacks
    charcoalBlack: darkMode ? '#F2F2F2' : '#404040',
    // blues
    zumthorBlue: darkMode ? '#212529' : '#EBF4FF',
    // TODO refactor; malibuBlue changed as quick hack to a different color JK 013120
    malibuBlue: darkMode ? '#E67AEF' : '#4C5480',
    // TODO refactor; royalBlue changed as quick hack to a different color JK 013120
    royalBlue: darkMode ? '#DC6BE5' : '#fafafa',
    loadingBlue: darkMode ? '#e4f0ff' : '#e4f0ff',

    // purples
    wisteriaPurple: '#DC6BE5',
    // reds
    salmonRed: '#FF6871',
    // orange
    pizazzOrange: '#FF8F05',
    // yellows
    warningYellow: '#FFE270',
    // body text color
    bodyText: '#90a4ae',
    //green
    connectedGreen: '#27AE60',

    //branded
    metaMaskOrange: '#E8831D',

    //specific
    textHover: darkMode ? '#90a4ae' : '#C4C4C4',

    // connect button when loggedout
    buttonFaded: darkMode ? '#DC6BE5' : '#737373',

    // media queries
    mediaWidth: mediaWidthTemplates,
    // css snippets
    flexColumnNoWrap: css`
        display: flex;
        flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
        display: flex;
        flex-flow: row nowrap;
    `,
});

export const GlobalStyle = createGlobalStyle`
  html {
    font-size: 16px;
    font-variant: none;
    color: ${({ theme }) => theme.textColor};
    background-color: ${({ theme }) => theme.backgroundColor};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  ::-webkit-scrollbar {
    display: none;
  }
`;
