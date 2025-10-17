import { browser, dev } from '$app/environment';

export const logger = {
  info: (message?: unknown, ...optionalParams: unknown[]) => {
    // if (browser && !dev) {
    //   return;
    // }

    console.log(message, optionalParams);
  },
  error: (message?: unknown, ...optionalParams: unknown[]) => {
    if (browser && !dev) {
      return;
    }

    console.error(message, optionalParams);
  }
};
