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
