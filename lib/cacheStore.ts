import { v4 as uuidV4 } from "uuid";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface CacheStoreItem<T> {
	name: string;
	value: T;
	expired: Date;
}
type CacheStoreItemValue<T> = T & { __CACHE_IDENTIFIER__?: string };
export interface CacheStoreState<T> {
	caches: Map<string, CacheStoreItem<CacheStoreItemValue<T>>>;
	lifetime: number;
	get: (name: string) => CacheStoreItemValue<T> | null;
	set: (name: string, value: CacheStoreItemValue<T> | null) => void;
}

export function createCacheStore<T>(name: string, lifetime: number = 10 * 60 * 1000) {
	return create<CacheStoreState<T>>()(
		devtools(
			(set, get) => ({
				caches: new Map<string, CacheStoreItem<CacheStoreItemValue<T>>>(),
				lifetime: lifetime,
				get: (name) => {
					const item = get().caches.get(name);
					if (item === undefined) return null;
					if (item.expired < new Date()) return null;
					return item.value;
				},
				set: (name, value) => {
					if (value === null) {
						get().caches.delete(name);
						return;
					}
					const { caches, lifetime, get: getCache } = get();
					const oldValue = getCache(name);
					if (oldValue !== null && oldValue?.__CACHE_IDENTIFIER__ === value.__CACHE_IDENTIFIER__) return;
					caches.set(name, {
						name: name,
						value: { __CACHE_IDENTIFIER__: uuidV4(), ...value },
						expired: new Date(Date.now() + lifetime),
					});
					set(() => ({ caches }));
				},
			}),
			{
				name: `${name}-cache-store`,
			},
		),
	);
}
