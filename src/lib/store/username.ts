import { browser } from '$app/environment';

export const getUsername = () => {
  if (browser) {
    return window.localStorage.getItem('username') || '' + Math.floor(Math.random() * 1000);
  }
  return '' + Math.floor(Math.random() * 1000);
};
