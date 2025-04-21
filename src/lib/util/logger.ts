import { dev } from '$app/environment';

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (message: string, ...args: any[]) => {
    if (dev) {
      console.log(message, ...args);
    }
  },
  error: (message: string, error?: Error | null) => {
    console.error(message, error);
  }
};
