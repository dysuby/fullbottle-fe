import dayjs from 'dayjs';

export function Now() {
  return dayjs();
}

export function FromUnixSeconds(seconds) {
  return dayjs.unix(seconds);
}

export function AddNow(delta, unit) {
  return dayjs().add(delta, unit);
}
