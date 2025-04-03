import type { TopicCardItem } from "~/components/topic/TopicCard";
import { createCacheStore } from "~/lib/cacheStore";

export const useTopicsCache = createCacheStore<TopicCardItem[]>("topics");
