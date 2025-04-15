import { AxiosError } from "axios";
import { AppState } from "react-native";
import { useTopicTrackingStore } from "~/store/topicTrackingStroe";

const PAUSE_UNLESS_SCROLLED = 1000 * 60 * 3;
const MAX_TRACKING_TIME = 1000 * 60 * 6;

const AJAX_FAILURE_DELAYS = [5000, 10000, 20000, 40000];
const ALLOWED_AJAX_FAILURES = [405, 429, 500, 501, 502, 503, 504];

interface TopicController {
	topicsTimings(data: {
		timings: Record<number, number>;
		topic_time: number;
		topic_id: number;
	}): Promise<unknown>;
	readPosts(topicId: number, postNumbers: number[]): void;
}

export default class ScreenTrack {
	_ajaxFailures = 0;
	_consolidatedTimings: {
		timings: Record<number, number>;
		topicTime: number;
		topicId: number;
	}[] = [];
	_lastTick: number | null = null;
	_lastScrolled: number | null = null;
	_lastFlush = 0;
	_timings = new Map<number, number>();
	_totalTimings = new Map<number, number>();
	_topicTime = 0;
	_onscreen: number[] | null = null;
	_readOnscreen: number[] | null = null;
	_readPosts = new Set<number>();
	_inProgress = false;
	_topicId: number | null = null;
	_interval: ReturnType<typeof setInterval> | null = null;
	_blockSendingToServerTill: number | null = null;
	_topicController: TopicController;
	_anonCallback: (() => void) | null = null;

	constructor(topicController: TopicController) {
		this._topicController = topicController;
		this.reset();
	}

	start(topicId: number | null) {
		if (this._topicId && this._topicId !== topicId) {
			this.tick();
			this.flush();
		}

		this.reset();

		// Create an interval timer if we don't have one.
		if (!this._interval) {
			this._interval = setInterval(() => {
				this.tick();
			}, 1500); // Discourse is 1000
		}

		this._topicId = topicId;
	}

	stop() {
		// already stopped no need to "extra stop"
		if (!this._topicId) {
			return;
		}

		this.tick();
		this.flush();
		this.reset();

		this._topicId = null;

		if (this._interval) {
			clearInterval(this._interval);
			this._interval = null;
		}
	}

	setOnscreen(onscreen: number[], readOnscreen: number[]) {
		this._onscreen = onscreen;
		this._readOnscreen = readOnscreen;
	}

	// Reset our timers
	reset() {
		const now = Date.now();
		this._lastTick = now;
		this._lastScrolled = now;
		this._lastFlush = 0;
		this._timings.clear();
		this._totalTimings.clear();
		this._topicTime = 0;
		this._onscreen = null;
		this._readOnscreen = null;
		this._readPosts.clear();
		this._inProgress = false;
	}

	scrolled() {
		this._lastScrolled = Date.now();
	}

	registerAnonCallback(cb: () => void) {
		this._anonCallback = cb;
	}

	consolidateTimings(timings: Record<number, number>, topicTime: number, topicId: number) {
		const foundIndex = this._consolidatedTimings.findIndex((elem) => elem.topicId === topicId);

		if (foundIndex > -1) {
			const found = this._consolidatedTimings[foundIndex];
			const lastIndex = this._consolidatedTimings.length - 1;

			if (foundIndex !== lastIndex) {
				const last = this._consolidatedTimings[lastIndex];
				this._consolidatedTimings[lastIndex] = found;
				this._consolidatedTimings[lastIndex - 1] = last;
			}

			// biome-ignore lint/complexity/noForEach: <explanation>
			Object.keys(found.timings).forEach((key) => {
				const id = Number.parseInt(key);
				if (timings[id]) {
					found.timings[id] += timings[id];
				}
			});

			found.topicTime += topicTime;
			found.timings = { ...timings, ...found.timings };
		} else {
			this._consolidatedTimings.push({ timings, topicTime, topicId });
		}

		const highestRead = Number.parseInt(Object.keys(timings).pop() ?? "0");
		const cachedHighestRead = this.highestReadFromCache(topicId);

		if (!cachedHighestRead || cachedHighestRead < highestRead) {
			useTopicTrackingStore.getState().setHighestSeenByTopic(topicId, highestRead);
			// setHighestReadCache(topicId, highestRead);
		}

		return this._consolidatedTimings;
	}

	highestReadFromCache(topicId: number) {
		return useTopicTrackingStore.getState().getHighestSeenByTopic(topicId);
	}

	async sendNextConsolidatedTiming() {
		if (this._consolidatedTimings.length === 0) {
			return;
		}

		if (this._inProgress) {
			return;
		}

		if (this._blockSendingToServerTill && this._blockSendingToServerTill > Date.now()) {
			return;
		}

		const itemToSend = this._consolidatedTimings.pop();
		if (!itemToSend) {
			return;
		}
		const { timings, topicTime, topicId } = itemToSend;
		const data = {
			timings,
			topic_time: topicTime,
			topic_id: topicId,
		};

		this._inProgress = true;

		try {
			// TODO: get 403, it blocked by cloudflare and showed "Just a moment..."
			// await this._topicController.topicsTimings(data);

			this._ajaxFailures = 0;
			const postNumbers = Object.keys(timings).map((v) => Number.parseInt(v));
			this._topicController.readPosts(topicId, postNumbers);

			const cachedHighestRead = this.highestReadFromCache(topicId);
			if (cachedHighestRead && cachedHighestRead <= postNumbers[postNumbers.length - 1]) {
				useTopicTrackingStore.getState().setHighestSeenByTopic(topicId, 0);
			}
		} catch (e) {
			if (e instanceof AxiosError) {
				if (e.response?.status && ALLOWED_AJAX_FAILURES.includes(e.response.status)) {
					const delay = AJAX_FAILURE_DELAYS[this._ajaxFailures];
					this._ajaxFailures += 1;

					if (delay) {
						this._blockSendingToServerTill = Date.now() + delay;
						// we did not send to the server, got to re-queue it
						this.consolidateTimings(timings, topicTime, topicId);
					}
				}
			}

			console.warn(`Failed to update topic times for topic ${topicId} due to error`, e);
		} finally {
			this._inProgress = false;
			this._lastFlush = 0;
		}
	}

	flush() {
		const newTimings: Record<number, number> = {};

		for (const [postNumber, time] of this._timings) {
			if (!this._totalTimings.has(postNumber)) {
				this._totalTimings.set(postNumber, 0);
			}

			const totalTiming = this._totalTimings.get(postNumber) ?? 0;
			if (time > 0 && totalTiming < MAX_TRACKING_TIME) {
				this._totalTimings.set(postNumber, totalTiming + time);
				newTimings[postNumber] = time;
			}

			this._timings.set(postNumber, 0);
		}

		const topicId = this._topicId;

		// Workaround to avoid ignored posts being "stuck unread"
		// const stream = this._topicController?.get("model.postStream");
		// if (
		// 	this.currentUser && // Logged in
		// 	this.currentUser.get("ignored_users.length") && // At least 1 user is ignored
		// 	stream && // Sanity check
		// 	stream.hasNoFilters && // The stream is not filtered (by username or summary)
		// 	!stream.canAppendMore && // We are at the end of the stream
		// 	stream.posts.lastObject && // The last post exists
		// 	stream.posts.lastObject.read && // The last post is read
		// 	stream.gaps && // The stream has gaps
		// 	!!stream.gaps.after[stream.posts.lastObject.id] && // Stream ends with a gap
		// 	stream.topic.last_read_post_number !==
		// 		stream.posts.lastObject.post_number + stream.get(`gaps.after.${stream.posts.lastObject.id}.length`) // The last post in the gap has not been marked read
		// ) {
		// 	newTimings[stream.posts.lastObject.post_number + stream.get(`gaps.after.${stream.posts.lastObject.id}.length`)] = 1;
		// }
		if (!topicId) return;

		const highestSeen = Object.keys(newTimings)
			.map((postNumber) => Number.parseInt(postNumber, 10))
			.reduce((a, b) => Math.max(a, b), 0);

		const highestSeenState = useTopicTrackingStore.getState().getHighestSeenByTopic(topicId);
		if (highestSeenState < highestSeen) {
			useTopicTrackingStore.getState().setHighestSeenByTopic(topicId, highestSeen);
		}

		if (highestSeen > 0) {
			// if (this.currentUser) {
			this.consolidateTimings(newTimings, this._topicTime, topicId);

			if (!isTesting()) {
				this.sendNextConsolidatedTiming();
			}
			// }

			this._topicTime = 0;
		}

		this._lastFlush = 0;
	}

	tick() {
		const now = Date.now();

		// If the user hasn't scrolled the browser in a long time, stop tracking time read
		const sinceScrolled = now - (this._lastScrolled ?? now);
		if (sinceScrolled > PAUSE_UNLESS_SCROLLED) {
			return;
		}

		const diff = now - (this._lastTick ?? now);
		this._lastFlush += diff;
		this._lastTick = now;

		// const flush_timings_secs = this.siteSettings.flush_timings_secs;
		const flush_timings_secs = 60; // default, from https://github.com/discourse/discourse/blob/main/config/site_settings.yml

		const nextFlush = flush_timings_secs * 1000;

		const rush = [...this._timings.entries()].some(([postNumber, timing]) => {
			return timing > 0 && !this._totalTimings.get(postNumber) && !this._readPosts.has(postNumber);
		});

		if (!this._inProgress && (this._lastFlush > nextFlush || rush)) {
			this.flush();
		}

		if (!this._inProgress) {
			// handles retries so there is no situation where we are stuck with a backlog
			this.sendNextConsolidatedTiming();
		}

		// const hasFocus = this.session.hasFocus;
		const hasFocus = AppState.currentState === "active";
		if (hasFocus) {
			this._topicTime += diff;

			// biome-ignore lint/complexity/noForEach: <explanation>
			this._onscreen?.forEach((postNumber: number) => this._timings.set(postNumber, (this._timings.get(postNumber) ?? 0) + diff));

			// biome-ignore lint/complexity/noForEach: <explanation>
			this._readOnscreen?.forEach((postNumber: number) => {
				this._readPosts.add(postNumber);
			});
		}
	}
}
function isTesting() {
	return false;
}
