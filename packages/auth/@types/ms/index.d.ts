declare module 'ms' {
  export interface MSOptions {
    long: boolean;
  }
  export default function (time: string, options?: MSOptions): number;
}
