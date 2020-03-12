import axios from '@/api/http';

function ADownload(data) {
  const result = data.result;
  const downloadToken = result.download_token;
  const link = document.createElement('a');
  link.href = `/v1/download/file/${downloadToken}`;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function DownloadFile(file_id) {
  return axios({
    url: '/v1/space/download/file',
    data: { file_id },
    method: 'POST',
  }).then(data => {
    ADownload(data);
  });
}

export function DownloadShareEntry({ token, access_token, path, file_id }) {
  return axios({
    url: `/v1/share/${token}/download`,
    data: { file_id, access_token, path },
    method: 'POST',
  }).then(data => {
    ADownload(data);
  });
}

export function ImageTumbnail(file_id, max_height, max_width) {
  return axios({
    url: `/v1/download/image/thumbnail?file_id=${file_id}&mh=${max_height}&mw=${max_width}`,
    method: 'GET',
    responseType: 'blob',
  }).then(data => URL.createObjectURL(data));
}
