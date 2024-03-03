import { precacheAndRoute, PrecacheEntry } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

const manifest: PrecacheEntry[] = (self.__WB_MANIFEST as PrecacheEntry[]);

precacheAndRoute(manifest);
