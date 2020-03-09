import axios from '@/api/http';

export function DownloadFile(file_id) {
  return axios({
    url: '/v1/space/download/file',
    data: { file_id },
    method: 'POST',
  }).then(resp => {
    const result = resp.data.result;
    const downloadToken = result.download_token;
    const link = document.createElement('a');
    link.href = `/v1/download/file/${downloadToken}`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}
