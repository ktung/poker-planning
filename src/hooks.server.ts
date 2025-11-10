// import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';

// import { fetchRoom } from '$lib/server/db/rooms';
// import { findUser } from '$lib/server/db/users';
// import { logger } from '$lib/util/logger';
// import { ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from '$lib/util/room';
// import { getJoinUrl } from '$lib/util/routes';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
    });
  });

// const handleRoom: Handle = async ({ event, resolve }) => {
//   const roomPathRegex = new RegExp(`^/[${ROOM_ID_ALPHABET}]{${ROOM_ID_LENGTH}}$`);
//   if (roomPathRegex.test(event.url.pathname)) {
//     const referer = event.request.headers.get('referer');

//     // direct access or request from room page (refresh or remote function)
//     if (!referer || (referer !== `${event.url.origin}/` && referer !== `${getJoinUrl(event.url.href)}`)) {
//       console.log('referer', referer);
//       const roomSlug = event.params.slug;
//       const userId = event.cookies.get('userId');
//       if (userId && roomSlug) {
//         const { error: fetchRoomError } = await fetchRoom(roomSlug);
//         const { data: currentUser } = await findUser(userId);
//         if (currentUser) {
//           return resolve(event);
//         }
//         // room exists, redirect to join page
//         if (!fetchRoomError) {
//           logger.error('Redirecting to join URL', roomSlug, fetchRoomError);
//           throw redirect(303, getJoinUrl(`${event.url.origin}/${roomSlug}`));
//         }
//       }

//       logger.error('Redirecting to /');
//       throw redirect(303, '/');
//     }
//   }

//   return resolve(event);
// };

export const handle: Handle = sequence(handleParaglide);
