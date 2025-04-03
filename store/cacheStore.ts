import type { TopicCardItem } from "~/components/topic/TopicCard";
import { createCacheStore } from "~/lib/cacheStore";
import type { GetTopic200 } from "~/lib/gen/api/discourseAPI/schemas";

export const useTopicsCache = createCacheStore<TopicCardItem[]>("topics");
export const usePostsCache = createCacheStore<GetTopic200>("posts");
