declare const __BUILD_DATE__: number;
declare const __VERSION__: string | undefined;

type Contributor = {
  name: string;
  email: string;
  url: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __BUILD_DATE__: number;
    __VERSION__?: string;
    __AUTHOR__?: Contributor;
  }

  declare const __BUILD_DATE__: number;
  declare const __VERSION__: string | undefined;
  declare const __AUTHOR__: Contributor | undefined;
}

export { };

