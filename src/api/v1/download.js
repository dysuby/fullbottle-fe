import axios from '@/api/http';

export function DownloadFile(file_id) {
  return axios({
    url: '/v1/space/download/file',
    data: { file_id },
    method: 'POST',
    responseType: 'blob',
  }).then(resp => {
    const cd = resp.headers['content-disposition'];
    if (cd && cd.indexOf('attachment') !== -1) {
      const startIndex = cd.indexOf('filename=') + 10;
      const endIndex = cd.length - 1;
      const filename = cd.substring(startIndex, endIndex);

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    }
  });
}
