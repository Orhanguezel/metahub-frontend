declare module '@formatjs/intl-localematcher' {
    export function match(
      supportedLocales: string[],
      requestedLocales: string[],
      defaultLocale: string
    ): string;
  }
  