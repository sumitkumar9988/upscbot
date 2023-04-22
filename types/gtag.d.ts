declare global {
  interface Window {
    gtag: (key: string, ...args: any[]) => void;
  }
}
