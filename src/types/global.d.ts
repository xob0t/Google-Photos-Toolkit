declare const unsafeWindow: Window & typeof globalThis & {
  WIZ_global_data: Record<string, unknown>;
  gptkApi: import('../api/api').default;
  gptkCore: import('../gptk-core').default;
  gptkApiUtils: import('../api/api-utils').default;
};

declare function GM_registerMenuCommand(caption: string, commandFunc: () => void): void;

declare const __VERSION__: string;
declare const __HOMEPAGE__: string;

declare module '*.html' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}
