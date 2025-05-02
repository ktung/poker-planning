import { redirect } from '@sveltejs/kit';
import { ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from '$lib/util/room';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params }) => {
  const slug = params.slug;

  const slugRegex = new RegExp(`^[${ROOM_ID_ALPHABET}]{${ROOM_ID_LENGTH}}$`);
  if (!slugRegex.test(slug)) {
    throw redirect(303, '/');
  }
};
