export const load = () => {
  const sessionId = crypto.randomUUID();

  return {
    sessionId
  };
};
