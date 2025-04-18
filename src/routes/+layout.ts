import { browser } from '$app/environment';

export const load = ({ data }) => {
  const sessionId = data.sessionId;

  if (browser) {
    window.sessionStorage.setItem('sessionId', sessionId);
  }
};
