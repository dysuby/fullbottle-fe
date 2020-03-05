export function SizeUnitConv(byteSize) {
  const unit = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  while (byteSize > 1024) {
    if (idx === 4) {
      break;
    }
    idx += 1;
    byteSize /= 1024;
  }
  return { value: Math.round(byteSize * 100) / 100, unit: unit[idx] };
}
