
type Contributor = {
  name: string;
  email: string;
  url: string;
}

declare const __BUILD_DATE__: number;
declare const __VERSION__: string | undefined;
declare const __AUTHOR__: Contributor | undefined;
declare const __REPOSITORY_URL__: string | undefined;
declare const __PLAY_SH_TEMPLATE__: string | undefined;
declare const __PLAY_PS1_TEMPLATE__: string | undefined;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __BUILD_DATE__: number;
    __VERSION__?: string;
    __AUTHOR__?: Contributor;
    __REPOSITORY_URL__?: string;
    __PLAY_SH_TEMPLATE__?: string;
    __PLAY_PS1_TEMPLATE__?: string;
  }

  declare const __BUILD_DATE__: number;
  declare const __VERSION__: string | undefined;
  declare const __AUTHOR__: Contributor | undefined;
  declare const __REPOSITORY_URL__: string | undefined;
  declare const __PLAY_SH_TEMPLATE__: string | undefined;
  declare const __PLAY_PS1_TEMPLATE__: string | undefined;
}

export { };

