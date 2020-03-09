import { extname } from 'path';

export function RoleMap(r) {
  switch (r) {
    case 1:
      return 'User';
    case 2:
      return 'Admin';
    default:
      return 'Unknown';
  }
}

export const DEFAULT_AVATAR = '/default.png';

export const VIRTUAL_ROOT = -1;

export const extFileType = function(filename) {
  const mp = {
    image: ['.gif', '.jpg', '.jpeg', '.png', '.bmp', '.webp'],
    video: ['.mp4', '.m3u8', '.rmvb', '.avi', '.swf', '.3gp', '.mkv', '.flv'],
    audio: ['.mp3', '.wav', '.wma', '.ogg', '.aac', '.flac'],
    document: [
      '.doc',
      '.txt',
      '.docx',
      '.pages',
      '.epub',
      '.pdf',
      '.numbers',
      '.csv',
      '.xls',
      '.xlsx',
      '.keynote',
      '.ppt',
      '.pptx',
    ],
  };
  const ext = extname(filename);
  if (!ext) return 'unknown';

  for (const category in mp) {
    const idx = mp[category].indexOf(ext);
    if (idx !== -1) return category;
  }

  return 'unknown';
};
