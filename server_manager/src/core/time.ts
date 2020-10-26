import momentTz from 'moment-timezone';

export function now() {
  return momentTz.tz(Date.now(), 'Asia/Bangkok');
}
