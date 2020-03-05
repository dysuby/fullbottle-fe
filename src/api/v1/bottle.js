import axios from '@/api/http';

export function GetSpaceMeta() {
  return axios({
    url: '/v1/space/meta',
  });
}
