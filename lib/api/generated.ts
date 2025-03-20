import type { operations } from "./schema.d.ts";

type Prettify<T> = {
	[K in keyof T]: T[K];
	// deno-lint-ignore ban-types
} & {};

export default class DiscourseAPIGenerated {
	async _exec<T>(_operationName: string, _params?: unknown): Promise<T> {
		throw new Error("Not implemented");
	}

	/**
	 * List backups
	 */
	getBackups(): Promise<Prettify<operations["getBackups"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getBackups"]>("getBackups") as unknown as Promise<
			Prettify<operations["getBackups"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Create backup
	 */
	createBackup(
		params: Prettify<NonNullable<operations["createBackup"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createBackup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createBackup"]>("createBackup", params) as unknown as Promise<
			Prettify<operations["createBackup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Download backup
	 */
	downloadBackup(
		params: Prettify<operations["downloadBackup"]["parameters"]["path"]> & Prettify<operations["downloadBackup"]["parameters"]["query"]>,
	): Promise<void> {
		return this._exec<operations["downloadBackup"]>("downloadBackup", params) as unknown as Promise<void>;
	}

	/**
	 * Send download backup email
	 */
	sendDownloadBackupEmail(params: Prettify<operations["sendDownloadBackupEmail"]["parameters"]["path"]>): Promise<void> {
		return this._exec<operations["sendDownloadBackupEmail"]>("sendDownloadBackupEmail", params) as unknown as Promise<void>;
	}

	/**
	 * List badges
	 */
	adminListBadges(): Promise<Prettify<operations["adminListBadges"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["adminListBadges"]>("adminListBadges") as unknown as Promise<
			Prettify<operations["adminListBadges"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Create badge
	 */
	createBadge(
		params: Prettify<NonNullable<operations["createBadge"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createBadge"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createBadge"]>("createBadge", params) as unknown as Promise<
			Prettify<operations["createBadge"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update badge
	 */
	updateBadge(
		params: Prettify<operations["updateBadge"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateBadge"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateBadge"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateBadge"]>("updateBadge", params) as unknown as Promise<
			Prettify<operations["updateBadge"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Delete badge
	 */
	deleteBadge(params: Prettify<operations["deleteBadge"]["parameters"]["path"]>): Promise<void> {
		return this._exec<operations["deleteBadge"]>("deleteBadge", params) as unknown as Promise<void>;
	}

	/**
	 * Retrieves a list of categories
	 */
	listCategories(
		params?: Prettify<operations["listCategories"]["parameters"]["query"]>,
	): Promise<Prettify<operations["listCategories"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listCategories"]>("listCategories", params) as unknown as Promise<
			Prettify<operations["listCategories"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Creates a category
	 */
	createCategory(
		params: Prettify<NonNullable<operations["createCategory"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createCategory"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createCategory"]>("createCategory", params) as unknown as Promise<
			Prettify<operations["createCategory"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Updates a category
	 */
	updateCategory(
		params: Prettify<operations["updateCategory"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateCategory"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateCategory"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateCategory"]>("updateCategory", params) as unknown as Promise<
			Prettify<operations["updateCategory"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * List topics
	 */
	listCategoryTopics(
		params: Prettify<operations["listCategoryTopics"]["parameters"]["path"]>,
	): Promise<Prettify<operations["listCategoryTopics"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listCategoryTopics"]>("listCategoryTopics", params) as unknown as Promise<
			Prettify<operations["listCategoryTopics"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Show category
	 */
	getCategory(
		params: Prettify<operations["getCategory"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getCategory"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getCategory"]>("getCategory", params) as unknown as Promise<
			Prettify<operations["getCategory"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Create a group
	 */
	createGroup(
		params: Prettify<NonNullable<operations["createGroup"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createGroup"]>("createGroup", params) as unknown as Promise<
			Prettify<operations["createGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Delete a group
	 */
	deleteGroup(
		params: Prettify<operations["deleteGroup"]["parameters"]["path"]>,
	): Promise<Prettify<operations["deleteGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["deleteGroup"]>("deleteGroup", params) as unknown as Promise<
			Prettify<operations["deleteGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a group
	 */
	getGroup(
		params: Prettify<operations["getGroup"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getGroup"]>("getGroup", params) as unknown as Promise<
			Prettify<operations["getGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update a group
	 */
	updateGroup(
		params: Prettify<operations["updateGroup"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateGroup"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateGroup"]>("updateGroup", params) as unknown as Promise<
			Prettify<operations["updateGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * List group members
	 */
	listGroupMembers(
		params: Prettify<operations["listGroupMembers"]["parameters"]["path"]>,
	): Promise<Prettify<operations["listGroupMembers"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listGroupMembers"]>("listGroupMembers", params) as unknown as Promise<
			Prettify<operations["listGroupMembers"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Add group members
	 */
	addGroupMembers(
		params: Prettify<operations["addGroupMembers"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["addGroupMembers"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["addGroupMembers"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["addGroupMembers"]>("addGroupMembers", params) as unknown as Promise<
			Prettify<operations["addGroupMembers"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Remove group members
	 */
	removeGroupMembers(
		params: Prettify<operations["removeGroupMembers"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["removeGroupMembers"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["removeGroupMembers"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["removeGroupMembers"]>("removeGroupMembers", params) as unknown as Promise<
			Prettify<operations["removeGroupMembers"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * List groups
	 */
	listGroups(): Promise<Prettify<operations["listGroups"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listGroups"]>("listGroups") as unknown as Promise<
			Prettify<operations["listGroups"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Create an invite
	 */
	createInvite(
		params?: Prettify<NonNullable<operations["createInvite"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createInvite"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createInvite"]>("createInvite", params) as unknown as Promise<
			Prettify<operations["createInvite"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Create multiple invites
	 */
	createMultipleInvites(
		params?: Prettify<NonNullable<operations["createMultipleInvites"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createMultipleInvites"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createMultipleInvites"]>("createMultipleInvites", params) as unknown as Promise<
			Prettify<operations["createMultipleInvites"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get the notifications that belong to the current user
	 */
	getNotifications(): Promise<Prettify<operations["getNotifications"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getNotifications"]>("getNotifications") as unknown as Promise<
			Prettify<operations["getNotifications"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Mark notifications as read
	 */
	markNotificationsAsRead(
		params?: Prettify<NonNullable<operations["markNotificationsAsRead"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["markNotificationsAsRead"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["markNotificationsAsRead"]>("markNotificationsAsRead", params) as unknown as Promise<
			Prettify<operations["markNotificationsAsRead"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * List latest posts across topics
	 */
	listPosts(
		params?: Prettify<operations["listPosts"]["parameters"]["query"]>,
	): Promise<Prettify<operations["listPosts"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listPosts"]>("listPosts", params) as unknown as Promise<
			Prettify<operations["listPosts"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Creates a new topic, a new post, or a private message
	 */
	createTopicPostPM(
		params: Prettify<NonNullable<operations["createTopicPostPM"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createTopicPostPM"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createTopicPostPM"]>("createTopicPostPM", params) as unknown as Promise<
			Prettify<operations["createTopicPostPM"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Retrieve a single post
	 * @description This endpoint can be used to get the number of likes on a post using the
	 * `actions_summary` property in the response. `actions_summary` responses
	 * with the id of `2` signify a `like`. If there are no `actions_summary`
	 * items with the id of `2`, that means there are 0 likes. Other ids likely
	 * refer to various different flag types.
	 */
	getPost(
		params: Prettify<operations["getPost"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getPost"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getPost"]>("getPost", params) as unknown as Promise<
			Prettify<operations["getPost"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update a single post
	 */
	updatePost(
		params: Prettify<operations["updatePost"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updatePost"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updatePost"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updatePost"]>("updatePost", params) as unknown as Promise<
			Prettify<operations["updatePost"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * delete a single post
	 */
	deletePost(
		params: Prettify<operations["deletePost"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["deletePost"]["requestBody"]>["content"]["application/json"]>,
	): Promise<void> {
		return this._exec<operations["deletePost"]>("deletePost", params) as unknown as Promise<void>;
	}

	/**
	 * List replies to a post
	 */
	postReplies(
		params: Prettify<operations["postReplies"]["parameters"]["path"]>,
	): Promise<Prettify<operations["postReplies"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["postReplies"]>("postReplies", params) as unknown as Promise<
			Prettify<operations["postReplies"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Lock a post from being edited
	 */
	lockPost(
		params: Prettify<operations["lockPost"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["lockPost"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["lockPost"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["lockPost"]>("lockPost", params) as unknown as Promise<
			Prettify<operations["lockPost"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Like a post and other actions
	 */
	performPostAction(
		params: Prettify<NonNullable<operations["performPostAction"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["performPostAction"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["performPostAction"]>("performPostAction", params) as unknown as Promise<
			Prettify<operations["performPostAction"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a list of private messages for a user
	 */
	listUserPrivateMessages(
		params: Prettify<operations["listUserPrivateMessages"]["parameters"]["path"]>,
	): Promise<Prettify<operations["listUserPrivateMessages"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listUserPrivateMessages"]>("listUserPrivateMessages", params) as unknown as Promise<
			Prettify<operations["listUserPrivateMessages"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a list of private messages sent for a user
	 */
	getUserSentPrivateMessages(
		params: Prettify<operations["getUserSentPrivateMessages"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getUserSentPrivateMessages"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getUserSentPrivateMessages"]>("getUserSentPrivateMessages", params) as unknown as Promise<
			Prettify<operations["getUserSentPrivateMessages"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Search for a term
	 */
	search(
		params?: Prettify<operations["search"]["parameters"]["query"]>,
	): Promise<Prettify<operations["search"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["search"]>("search", params) as unknown as Promise<
			Prettify<operations["search"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get site info
	 * @description Can be used to fetch all categories and subcategories
	 */
	getSite(): Promise<Prettify<operations["getSite"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getSite"]>("getSite") as unknown as Promise<
			Prettify<operations["getSite"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get site basic info
	 * @description Can be used to fetch basic info about a site
	 */
	getSiteBasicInfo(): Promise<Prettify<operations["getSiteBasicInfo"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getSiteBasicInfo"]>("getSiteBasicInfo") as unknown as Promise<
			Prettify<operations["getSiteBasicInfo"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a list of tag groups
	 */
	listTagGroups(): Promise<Prettify<operations["listTagGroups"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listTagGroups"]>("listTagGroups") as unknown as Promise<
			Prettify<operations["listTagGroups"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Creates a tag group
	 */
	createTagGroup(
		params: Prettify<NonNullable<operations["createTagGroup"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createTagGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createTagGroup"]>("createTagGroup", params) as unknown as Promise<
			Prettify<operations["createTagGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a single tag group
	 */
	getTagGroup(
		params: Prettify<operations["getTagGroup"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getTagGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getTagGroup"]>("getTagGroup", params) as unknown as Promise<
			Prettify<operations["getTagGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update tag group
	 */
	updateTagGroup(
		params: Prettify<operations["updateTagGroup"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateTagGroup"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateTagGroup"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateTagGroup"]>("updateTagGroup", params) as unknown as Promise<
			Prettify<operations["updateTagGroup"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a list of tags
	 */
	listTags(): Promise<Prettify<operations["listTags"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listTags"]>("listTags") as unknown as Promise<
			Prettify<operations["listTags"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a specific tag
	 */
	getTag(
		params: Prettify<operations["getTag"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getTag"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getTag"]>("getTag", params) as unknown as Promise<
			Prettify<operations["getTag"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get specific posts from a topic
	 */
	getSpecificPostsFromTopic(
		params: Prettify<operations["getSpecificPostsFromTopic"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["getSpecificPostsFromTopic"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["getSpecificPostsFromTopic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getSpecificPostsFromTopic"]>("getSpecificPostsFromTopic", params) as unknown as Promise<
			Prettify<operations["getSpecificPostsFromTopic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a single topic
	 */
	getTopic(
		params: Prettify<operations["getTopic"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getTopic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getTopic"]>("getTopic", params) as unknown as Promise<
			Prettify<operations["getTopic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Remove a topic
	 */
	removeTopic(params: Prettify<operations["removeTopic"]["parameters"]["path"]>): Promise<void> {
		return this._exec<operations["removeTopic"]>("removeTopic", params) as unknown as Promise<void>;
	}

	/**
	 * Update a topic
	 */
	updateTopic(
		params: Prettify<operations["updateTopic"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateTopic"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateTopic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateTopic"]>("updateTopic", params) as unknown as Promise<
			Prettify<operations["updateTopic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Invite to topic
	 */
	inviteToTopic(
		params: Prettify<operations["inviteToTopic"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["inviteToTopic"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["inviteToTopic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["inviteToTopic"]>("inviteToTopic", params) as unknown as Promise<
			Prettify<operations["inviteToTopic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Invite group to topic
	 */
	inviteGroupToTopic(
		params: Prettify<operations["inviteGroupToTopic"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["inviteGroupToTopic"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["inviteGroupToTopic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["inviteGroupToTopic"]>("inviteGroupToTopic", params) as unknown as Promise<
			Prettify<operations["inviteGroupToTopic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Bookmark topic
	 */
	bookmarkTopic(params: Prettify<operations["bookmarkTopic"]["parameters"]["path"]>): Promise<void> {
		return this._exec<operations["bookmarkTopic"]>("bookmarkTopic", params) as unknown as Promise<void>;
	}

	/**
	 * Update the status of a topic
	 */
	updateTopicStatus(
		params: Prettify<operations["updateTopicStatus"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateTopicStatus"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateTopicStatus"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateTopicStatus"]>("updateTopicStatus", params) as unknown as Promise<
			Prettify<operations["updateTopicStatus"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get the latest topics
	 */
	listLatestTopics(
		params?: Prettify<operations["listLatestTopics"]["parameters"]["query"]>,
	): Promise<Prettify<operations["listLatestTopics"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listLatestTopics"]>("listLatestTopics", params) as unknown as Promise<
			Prettify<operations["listLatestTopics"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get the top topics filtered by period
	 */
	listTopTopics(
		params?: Prettify<operations["listTopTopics"]["parameters"]["query"]>,
	): Promise<Prettify<operations["listTopTopics"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listTopTopics"]>("listTopTopics", params) as unknown as Promise<
			Prettify<operations["listTopTopics"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Set notification level
	 */
	setNotificationLevel(
		params: Prettify<operations["setNotificationLevel"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["setNotificationLevel"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["setNotificationLevel"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["setNotificationLevel"]>("setNotificationLevel", params) as unknown as Promise<
			Prettify<operations["setNotificationLevel"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update topic timestamp
	 */
	updateTopicTimestamp(
		params: Prettify<operations["updateTopicTimestamp"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateTopicTimestamp"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateTopicTimestamp"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateTopicTimestamp"]>("updateTopicTimestamp", params) as unknown as Promise<
			Prettify<operations["updateTopicTimestamp"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Create topic timer
	 */
	createTopicTimer(
		params: Prettify<operations["createTopicTimer"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["createTopicTimer"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createTopicTimer"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createTopicTimer"]>("createTopicTimer", params) as unknown as Promise<
			Prettify<operations["createTopicTimer"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get topic by external_id
	 */
	getTopicByExternalId(
		params: Prettify<operations["getTopicByExternalId"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getTopic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getTopicByExternalId"]>("getTopicByExternalId", params) as unknown as Promise<
			Prettify<operations["getTopic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Creates an upload
	 */
	createUpload(
		params: Prettify<NonNullable<operations["createUpload"]["requestBody"]>["content"]["multipart/form-data"]>,
	): Promise<Prettify<operations["createUpload"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createUpload"]>("createUpload", params) as unknown as Promise<
			Prettify<operations["createUpload"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
   * Initiates a direct external upload
   * @description Direct external uploads bypass the usual method of creating uploads
   * via the POST /uploads route, and upload directly to an external provider,
   * which by default is S3. This route begins the process, and will return
   * a unique identifier for the external upload as well as a presigned URL
   * which is where the file binary blob should be uploaded to.

   * Once the upload is complete to the external service, you must call the
   * POST /complete-external-upload route using the unique identifier returned
   * by this route, which will create any required Upload record in the Discourse
   * database and also move file from its temporary location to the final
   * destination in the external storage service.

   * You must have the correct permissions and CORS settings configured in your
   * external provider. We support AWS S3 as the default. See:

   * https://meta.discourse.org/t/-/210469#s3-multipart-direct-uploads-4.

   * An external file store must be set up and `enable_direct_s3_uploads` must
   * be set to true for this endpoint to function.
   */
	generatePresignedPut(
		params: Prettify<NonNullable<operations["generatePresignedPut"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["generatePresignedPut"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["generatePresignedPut"]>("generatePresignedPut", params) as unknown as Promise<
			Prettify<operations["generatePresignedPut"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
   * Completes a direct external upload
   * @description Completes an external upload initialized with /get-presigned-put. The
   * file will be moved from its temporary location in external storage to
   * a final destination in the S3 bucket. An Upload record will also be
   * created in the database in most cases.

   * If a sha1-checksum was provided in the initial request it will also
   * be compared with the uploaded file in storage to make sure the same
   * file was uploaded. The file size will be compared for the same reason.

   * You must have the correct permissions and CORS settings configured in your
   * external provider. We support AWS S3 as the default. See:

   * https://meta.discourse.org/t/-/210469#s3-multipart-direct-uploads-4.

   * An external file store must be set up and `enable_direct_s3_uploads` must
   * be set to true for this endpoint to function.
   */
	completeExternalUpload(
		params: Prettify<NonNullable<operations["completeExternalUpload"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["completeExternalUpload"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["completeExternalUpload"]>("completeExternalUpload", params) as unknown as Promise<
			Prettify<operations["completeExternalUpload"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
   * Creates a multipart external upload
   * @description Creates a multipart upload in the external storage provider, storing
   * a temporary reference to the external upload similar to /get-presigned-put.

   * You must have the correct permissions and CORS settings configured in your
   * external provider. We support AWS S3 as the default. See:

   * https://meta.discourse.org/t/-/210469#s3-multipart-direct-uploads-4.

   * An external file store must be set up and `enable_direct_s3_uploads` must
   * be set to true for this endpoint to function.
   */
	createMultipartUpload(
		params: Prettify<NonNullable<operations["createMultipartUpload"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createMultipartUpload"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createMultipartUpload"]>("createMultipartUpload", params) as unknown as Promise<
			Prettify<operations["createMultipartUpload"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
   * Generates batches of presigned URLs for multipart parts
   * @description Multipart uploads are uploaded in chunks or parts to individual presigned
   * URLs, similar to the one generated by /generate-presigned-put. The part
   * numbers provided must be between 1 and 10000. The total number of parts
   * will depend on the chunk size in bytes that you intend to use to upload
   * each chunk. For example a 12MB file may have 2 5MB chunks and a final
   * 2MB chunk, for part numbers 1, 2, and 3.

   * This endpoint will return a presigned URL for each part number provided,
   * which you can then use to send PUT requests for the binary chunk corresponding
   * to that part. When the part is uploaded, the provider should return an
   * ETag for the part, and this should be stored along with the part number,
   * because this is needed to complete the multipart upload.

   * You must have the correct permissions and CORS settings configured in your
   * external provider. We support AWS S3 as the default. See:

   * https://meta.discourse.org/t/-/210469#s3-multipart-direct-uploads-4.

   * An external file store must be set up and `enable_direct_s3_uploads` must
   * be set to true for this endpoint to function.
   */
	batchPresignMultipartParts(
		params: Prettify<NonNullable<operations["batchPresignMultipartParts"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["batchPresignMultipartParts"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["batchPresignMultipartParts"]>("batchPresignMultipartParts", params) as unknown as Promise<
			Prettify<operations["batchPresignMultipartParts"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
   * Abort multipart upload
   * @description This endpoint aborts the multipart upload initiated with /create-multipart.
   * This should be used when cancelling the upload. It does not matter if parts
   * were already uploaded into the external storage provider.

   * You must have the correct permissions and CORS settings configured in your
   * external provider. We support AWS S3 as the default. See:

   * https://meta.discourse.org/t/-/210469#s3-multipart-direct-uploads-4.

   * An external file store must be set up and `enable_direct_s3_uploads` must
   * be set to true for this endpoint to function.
   */
	abortMultipart(
		params: Prettify<NonNullable<operations["abortMultipart"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["abortMultipart"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["abortMultipart"]>("abortMultipart", params) as unknown as Promise<
			Prettify<operations["abortMultipart"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
   * Complete multipart upload
   * @description Completes the multipart upload in the external store, and copies the
   * file from its temporary location to its final location in the store.
   * All of the parts must have been uploaded to the external storage provider.
   * An Upload record will be completed in most cases once the file is copied
   * to its final location.

   * You must have the correct permissions and CORS settings configured in your
   * external provider. We support AWS S3 as the default. See:

   * https://meta.discourse.org/t/-/210469#s3-multipart-direct-uploads-4.

   * An external file store must be set up and `enable_direct_s3_uploads` must
   * be set to true for this endpoint to function.
   */
	completeMultipart(
		params: Prettify<NonNullable<operations["completeMultipart"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["completeMultipart"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["completeMultipart"]>("completeMultipart", params) as unknown as Promise<
			Prettify<operations["completeMultipart"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * List badges for a user
	 */
	listUserBadges(
		params: Prettify<operations["listUserBadges"]["parameters"]["path"]>,
	): Promise<Prettify<operations["listUserBadges"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listUserBadges"]>("listUserBadges", params) as unknown as Promise<
			Prettify<operations["listUserBadges"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Creates a user
	 */
	createUser(
		params: Prettify<NonNullable<operations["createUser"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["createUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["createUser"]>("createUser", params) as unknown as Promise<
			Prettify<operations["createUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a single user by username
	 */
	getUser(
		params: Prettify<operations["getUser"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getUser"]>("getUser", params) as unknown as Promise<
			Prettify<operations["getUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update a user
	 */
	updateUser(
		params: Prettify<operations["updateUser"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateUser"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateUser"]>("updateUser", params) as unknown as Promise<
			Prettify<operations["updateUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a user by external_id
	 */
	getUserExternalId(
		params: Prettify<operations["getUserExternalId"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getUserExternalId"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getUserExternalId"]>("getUserExternalId", params) as unknown as Promise<
			Prettify<operations["getUserExternalId"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a user by identity provider external ID
	 */
	getUserIdentiyProviderExternalId(
		params: Prettify<operations["getUserIdentiyProviderExternalId"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getUserIdentiyProviderExternalId"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getUserIdentiyProviderExternalId"]>("getUserIdentiyProviderExternalId", params) as unknown as Promise<
			Prettify<operations["getUserIdentiyProviderExternalId"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update avatar
	 */
	updateAvatar(
		params: Prettify<operations["updateAvatar"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateAvatar"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["updateAvatar"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["updateAvatar"]>("updateAvatar", params) as unknown as Promise<
			Prettify<operations["updateAvatar"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Update email
	 */
	updateEmail(
		params: Prettify<operations["updateEmail"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateEmail"]["requestBody"]>["content"]["application/json"]>,
	): Promise<void> {
		return this._exec<operations["updateEmail"]>("updateEmail", params) as unknown as Promise<void>;
	}

	/**
	 * Update username
	 */
	updateUsername(
		params: Prettify<operations["updateUsername"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["updateUsername"]["requestBody"]>["content"]["application/json"]>,
	): Promise<void> {
		return this._exec<operations["updateUsername"]>("updateUsername", params) as unknown as Promise<void>;
	}

	/**
	 * Get a public list of users
	 */
	listUsersPublic(
		params: Prettify<operations["listUsersPublic"]["parameters"]["query"]>,
	): Promise<Prettify<operations["listUsersPublic"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listUsersPublic"]>("listUsersPublic", params) as unknown as Promise<
			Prettify<operations["listUsersPublic"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a user by id
	 */
	adminGetUser(
		params: Prettify<operations["adminGetUser"]["parameters"]["path"]>,
	): Promise<Prettify<operations["adminGetUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["adminGetUser"]>("adminGetUser", params) as unknown as Promise<
			Prettify<operations["adminGetUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Delete a user
	 */
	deleteUser(
		params: Prettify<operations["deleteUser"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["deleteUser"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["deleteUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["deleteUser"]>("deleteUser", params) as unknown as Promise<
			Prettify<operations["deleteUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Activate a user
	 */
	activateUser(
		params: Prettify<operations["activateUser"]["parameters"]["path"]>,
	): Promise<Prettify<operations["activateUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["activateUser"]>("activateUser", params) as unknown as Promise<
			Prettify<operations["activateUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Deactivate a user
	 */
	deactivateUser(
		params: Prettify<operations["deactivateUser"]["parameters"]["path"]>,
	): Promise<Prettify<operations["deactivateUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["deactivateUser"]>("deactivateUser", params) as unknown as Promise<
			Prettify<operations["deactivateUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Suspend a user
	 */
	suspendUser(
		params: Prettify<operations["suspendUser"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["suspendUser"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["suspendUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["suspendUser"]>("suspendUser", params) as unknown as Promise<
			Prettify<operations["suspendUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Silence a user
	 */
	silenceUser(
		params: Prettify<operations["silenceUser"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["silenceUser"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["silenceUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["silenceUser"]>("silenceUser", params) as unknown as Promise<
			Prettify<operations["silenceUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Anonymize a user
	 */
	anonymizeUser(
		params: Prettify<operations["anonymizeUser"]["parameters"]["path"]>,
	): Promise<Prettify<operations["anonymizeUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["anonymizeUser"]>("anonymizeUser", params) as unknown as Promise<
			Prettify<operations["anonymizeUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Log a user out
	 */
	logOutUser(
		params: Prettify<operations["logOutUser"]["parameters"]["path"]>,
	): Promise<Prettify<operations["logOutUser"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["logOutUser"]>("logOutUser", params) as unknown as Promise<
			Prettify<operations["logOutUser"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Refresh gravatar
	 */
	refreshGravatar(
		params: Prettify<operations["refreshGravatar"]["parameters"]["path"]>,
	): Promise<Prettify<operations["refreshGravatar"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["refreshGravatar"]>("refreshGravatar", params) as unknown as Promise<
			Prettify<operations["refreshGravatar"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a list of users
	 */
	adminListUsers(
		params: Prettify<operations["adminListUsers"]["parameters"]["path"]> & Prettify<operations["adminListUsers"]["parameters"]["query"]>,
	): Promise<Prettify<operations["adminListUsers"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["adminListUsers"]>("adminListUsers", params) as unknown as Promise<
			Prettify<operations["adminListUsers"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Get a list of user actions
	 */
	listUserActions(
		params: Prettify<operations["listUserActions"]["parameters"]["query"]>,
	): Promise<Prettify<operations["listUserActions"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["listUserActions"]>("listUserActions", params) as unknown as Promise<
			Prettify<operations["listUserActions"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Send password reset email
	 */
	sendPasswordResetEmail(
		params: Prettify<NonNullable<operations["sendPasswordResetEmail"]["requestBody"]>["content"]["application/json"]>,
	): Promise<Prettify<operations["sendPasswordResetEmail"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["sendPasswordResetEmail"]>("sendPasswordResetEmail", params) as unknown as Promise<
			Prettify<operations["sendPasswordResetEmail"]["responses"]["200"]["content"]["application/json"]>
		>;
	}

	/**
	 * Change password
	 */
	changePassword(
		params: Prettify<operations["changePassword"]["parameters"]["path"]> &
			Prettify<NonNullable<operations["changePassword"]["requestBody"]>["content"]["application/json"]>,
	): Promise<void> {
		return this._exec<operations["changePassword"]>("changePassword", params) as unknown as Promise<void>;
	}

	/**
	 * Get email addresses belonging to a user
	 */
	getUserEmails(
		params: Prettify<operations["getUserEmails"]["parameters"]["path"]>,
	): Promise<Prettify<operations["getUserEmails"]["responses"]["200"]["content"]["application/json"]>> {
		return this._exec<operations["getUserEmails"]>("getUserEmails", params) as unknown as Promise<
			Prettify<operations["getUserEmails"]["responses"]["200"]["content"]["application/json"]>
		>;
	}
}
