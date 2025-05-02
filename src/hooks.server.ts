import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
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
    if (!referer) {
      logger.error('referer null', referer);
      throw redirect(303, '/');
    }
    if (referer !== `${event.url.origin}/` && referer !== `${getJoinUrl(event.url.href)}`) {
      logger.debug('referer', referer);
      throw redirect(303, '/');
    }
  }

  return resolve(event);
};

export const handle: Handle = sequence(handleRoom, handleParaglide);
