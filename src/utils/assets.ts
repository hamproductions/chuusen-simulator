import { join } from 'path-browserify';

export const getAssetUrl = (path: string) => {
  return join(import.meta.env.PUBLIC_ENV__BASE_URL ?? '/', path);
};
