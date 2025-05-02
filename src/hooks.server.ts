import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { fetchRoom } from '$lib/db/rooms';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { logger } from '$lib/util/logger';
import { ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from '$lib/util/room';
import { getJoinUrl } from '$lib/util/routes';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
    });
  });

const handleRoom: Handle = async ({ event, resolve }) => {
  const roomPathRegex = new RegExp(`^/[${ROOM_ID_ALPHABET}]{${ROOM_ID_LENGTH}}$`);
  if (roomPathRegex.test(event.url.pathname)) {
    const referer = event.request.headers.get('referer');
    if (!referer || (referer !== `${event.url.origin}/` && referer !== `${getJoinUrl(event.url.href)}`)) {
      logger.error('referer', referer);

      const roomSlug = event.params.slug;
      if (roomSlug) {
        const { error } = await fetchRoom(roomSlug);
        if (!error) {
          throw redirect(303, getJoinUrl(`${event.url.origin}/${roomSlug}`));
        }
      }

      throw redirect(303, '/');
    }
  }

  return resolve(event);
};

export const handle: Handle = sequence(handleRoom, handleParaglide);
