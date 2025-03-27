import type { AxiosRequestConfig } from "axios";
import DiscourseAPI from "./api";
import { checkCookie, loadCookieJar, saveCookieJar } from "./cookieManager";
import type { ListLatestTopics200 } from "./gen/api/discourseAPI/schemas";

export default class LinuxDoClient extends DiscourseAPI {
	static async create(): Promise<LinuxDoClient> {
		const cookieJar = await loadCookieJar();
		if (!(await checkCookie(cookieJar))) throw new Error("Cookie check failed: `_t` cookie not found");
		const client = new LinuxDoClient("https://linux.do", {
			initialCookie: cookieJar,
		});
		client.on("cookieChanged", saveCookieJar);
		return client;
	}

	getLoadMoreTopicsUrl(result: (ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }) | undefined): string | null {
		return result?.topic_list?.more_topics_url ?? null;
	}

	async loadMoreTopics(
		input: (ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }) | string,
	): Promise<(ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }) | null> {
		const more_topics_url = typeof input === "string" ? input : this.getLoadMoreTopicsUrl(input);
		if (more_topics_url) {
			// I don't understand why this is needed, but they said that:
			// 'ensure we postfix with .json so username paths work correctly'
			// https://github.com/discourse/discourse/blob/ab3e85f8f10f5df7ccf70ab4d7b5e606b8a7c41e/app/assets/javascripts/discourse/app/models/topic-list.js#L175
			more_topics_url.replace(/(?!\.json)\?/, ".json?");

			const response = await this.axiosInstance.get(more_topics_url);
			return response.data;
		}
		return null;
	}

	/// `/latest?no_definitions=true&page=1`
	async listLatestTopicsByPage(
		data?: {
			no_definitions: boolean;
			page: number;
		},
		config?: AxiosRequestConfig,
	): Promise<ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }> {
		return (
			await this.axiosInstance.get("/latest.json", {
				data,
				...config,
			})
		).data;
	}

	async listUnreadTopics(config?: AxiosRequestConfig): Promise<ListLatestTopics200 & { topic_list?: { more_topics_url?: string } }> {
		return (await this.axiosInstance.get("/unread.json", config)).data;
	}
}
