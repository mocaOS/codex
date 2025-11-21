// import types from ./directus.d.ts and ./opensea.d.ts files, and export them as a single module
import type * as Directus from './directus';

declare global {
  namespace Types {
    export { Directus };
  }
}

export { Directus };
