import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface CacheStoreItem<T> {
	name: string;
	value: T;
	expired: Date;
}

export interface CacheStoreState<T> {
	caches: Map<string, CacheStoreItem<T>>;
	lifetime: number;
	get: (name: string) => T | null;
	set: (name: string, value: T | null) => void;
}

export function createCacheStore<T>(name: string, lifetime: number = 10 * 60 * 1000) {
	return create<CacheStoreState<T>>()(
		devtools(
			(set, get) => ({
				caches: new Map<string, CacheStoreItem<T>>(),
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
					const { caches, lifetime } = get();
					caches.set(name, {
						name: name,
						value: value,
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
