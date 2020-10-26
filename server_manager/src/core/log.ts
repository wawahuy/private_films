export async function logTimer(name: string, func: () => void) {
  const t = new Date().getTime();
  await func();
  console.log(name, new Date().getTime() - t);
}
