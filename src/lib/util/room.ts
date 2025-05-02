import { customAlphabet } from 'nanoid';

export const ROOM_ID_LENGTH = 21;
export const ROOM_ID_ALPHABET = 'useandom26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict-';

// @see https://github.com/ai/nanoid?tab=readme-ov-file#custom-alphabet-or-size
export const generateRoomId = () => {
  const nanoid = customAlphabet(ROOM_ID_ALPHABET, ROOM_ID_LENGTH);
  return nanoid();
};
