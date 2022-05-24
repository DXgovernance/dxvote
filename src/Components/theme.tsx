import theme from 'theme/dark.json';

// TODO: This is a hack to make the GuildsTheme interface work with DXvote themes.
// Refactor this once we move DXvote into a separate repo.
interface ThemeBase {
  [key: string]: any | any[];
}

export interface GuildsTheme extends ThemeBase {
  colors?: {
    text: string;
    primary: string;
    secondary: string;
    red: string;
    proposalText: {
      grey: string;
      lightGrey: string;
    };
    card: {
      grey: string;
      green: string;
    };
    background: string;
    modalBackground?: string;
    button: {
      primary: string;
      secondary: string;
    };
    muted: string;
    hoverMenu?: string;
    border: {
      initial: string;
      hover: string;
    };
    votes: { [key: number]: string };
    params: { [key: number]: string };
  };
  fonts?: {
    body: string;
    heading: string;
    monospace: string;
  };
  fontSizes?: {
    label: string;
    mono: string;
    body: string;
    header1: string;
    header2: string;
  };
  lineHeights?: {
    label: number;
    mono: number;
    body: number;
    header1: number;
    header2: number;
  };
  fontWeights?: {
    regular: number;
    medium: number;
    bold: number;
  };
  radii?: {
    curved: string;
    pill: string;
    rounded: string;
  };
}

console.log({ theme });

export const GuildsDarkTheme: GuildsTheme = theme;
