import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param: string) => {
  return /[\w-]{21}/.test(param);
}) satisfies ParamMatcher;
