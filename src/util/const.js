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
