import DiscourseAPI from "./api";
import type { operations } from "./api/schema";
import { checkCookie, loadCookieJar, saveCookieJar } from "./cookieManager";
import { getDiscourseAPIDocumentation } from "./gen/api/discourseAPI";
import type { Prettify } from "./utils";

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

	/// `/latest?no_definitions=true&page=1`
	async listLatestTopicsEx(data?: {
		no_definitions: boolean;
		page: number;
	}): Promise<Prettify<operations["listLatestTopics"]["responses"]["200"]["content"]["application/json"]>> {
		const res = await this.axiosInstance.get("/latest", {
			data,
		});
		return res.data;
	}
}
