export function isProd() {
  return process.env.NODE_ENV === 'production';
}

export function isTest() {
  return process.env.NODE_ENV === 'test';
}

export function isDev() {
  return (
    process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
  );
}
