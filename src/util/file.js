import SparkMD5 from 'spark-md5';

export const CHUNK_SIZE = 1 << 20;

export function SizeUnitConv(byteSize) {
  const unit = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  while (byteSize >= 1024) {
    if (idx === 4) {
      break;
    }
    idx += 1;
    byteSize /= 1024;
  }
  return { value: Math.round(byteSize * 100) / 100, unit: unit[idx] };
}

/**
 * calculate file md5 chunk by chunk
 */
export function CalculateFileChunkMd5(file) {
  const fileSize = file.size;
  const chunkSize = CHUNK_SIZE;
  const slice =
    File.prototype.slice ||
    File.prototype.mozSlice ||
    File.prototype.webkitSlice;
  let offset = 0;
  const chunkHash = [];

  // read with the first block
  return new Promise((resolve, reject) => {
    const readEventHandler = function(evt) {
      if (evt.target.error === null) {
        offset += evt.target.result.byteLength;
        chunkHash.push(SparkMD5.ArrayBuffer.hash(evt.target.result));
      } else {
        reject(evt.target.error);
        return;
      }
      if (offset >= fileSize) {
        resolve(chunkHash);
        return;
      }

      // next chunk
      chunkReaderBlock(offset, chunkSize, file);
    };

    const chunkReaderBlock = function(_offset, length, _file) {
      const r = new FileReader();
      const end = length + _offset < fileSize ? length + _offset : fileSize;
      const blob = slice.call(_file, _offset, end);
      r.onload = readEventHandler;
      r.readAsArrayBuffer(blob);
    };
    chunkReaderBlock(offset, chunkSize, file);
  });
}
