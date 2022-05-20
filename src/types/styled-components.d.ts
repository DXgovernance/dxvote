import { GuildsTheme } from "Components/theme"

// Override the styled components default theme
declare module 'styled-components' {
  export interface DefaultTheme extends GuildsTheme {}
}