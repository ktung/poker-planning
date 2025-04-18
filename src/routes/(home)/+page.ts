export const load = ({ url }) => {
  const join = url.searchParams.get('join');

  return {
    join: join
  };
};
