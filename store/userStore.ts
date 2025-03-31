import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { GetUser200 } from "~/lib/gen/api/discourseAPI/schemas";
import { useLinuxDoClientStore } from "./linuxDoClientStore";

type UserData =
	| (GetUser200 & {
			user_badges?: {
				id: number;
				granted_at: string;
				created_at: string;
				count: number;
				badge_id: number;
				user_id: number;
				granted_by_id: number;
			}[];
			badge_types?: {
				id: number;
				name: string;
				sort_order: number;
			}[];
			users?: {
				id: number;
				username: string;
				name?: string;
				avatar_template?: string;
				admin?: boolean;
				moderator?: boolean;
				trust_level: number;
				animated_avatar: string | null;
			}[];
			user: {
				id: number;
				username: string;
				name?: string;
				avatar_template?: string;
				email?: string;
				secondary_emails?: string[];
				unconfirmed_emails?: string[];
				last_posted_at?: string;
				last_seen_at?: string;
				created_at: string;
				ignored?: boolean;
				muted?: boolean;
				can_ignore_user?: boolean;
				can_mute_user?: boolean;
				can_send_private_messages?: boolean;
				can_send_private_message_to_user?: boolean;
				trust_level: number;
				moderator?: boolean;
				admin?: boolean;
				title: string | null;
				badge_count: number;
				user_fields?: unknown;
				custom_fields?: {
					"holidays-region"?: string;
					see_signatures?: boolean | "true" | "false";
					signature_url?: string;
					notify_me_when_followed?: boolean | "true" | "false";
					notify_followed_user_when_followed?: boolean | "true" | "false";
					notify_me_when_followed_replies?: boolean | "true" | "false";
					notify_me_when_followed_creates_topic?: boolean | "true" | "false";
					allow_people_to_follow_me?: boolean | "true" | "false";
					last_chat_channel_id?: number;
				};
				time_read?: number;
				recent_time_read?: number;
				primary_group_id?: null;
				primary_group_name?: null;
				flair_group_id?: null;
				flair_name?: null;
				flair_url?: null;
				flair_bg_color?: null;
				flair_color?: null;
				featured_topic?: null;
				timezone?: string;
				pending_posts_count?: number;
				bio_excerpt?: string;
				card_background_upload_url?: string;
				bio_raw?: string;
				bio_cooke?: string;
				can_edit?: boolean;
				can_edit_username?: boolean;
				can_edit_email?: boolean;
				can_edit_name?: boolean;
				uploaded_avatar_id?: number;
				has_title_badges?: boolean;
				pending_count?: number;
				profile_view_count?: number;
				second_factor_enabled?: boolean;
				second_factor_backup_enabled: boolean;
				associated_accounts?: {
					name: string;
					description: string;
				}[];
				can_upload_profile_header: boolean;
				can_upload_user_card_background: boolean;
				locale?: string | null;
				muted_category_ids?: number[];
				regular_category_ids: [];
				watched_tags: [];
				watching_first_post_tags: [];
				tracked_tags: [];
				muted_tags: [];
				tracked_category_ids: [];
				watched_category_ids: [];
				watched_first_post_category_ids: [];
				system_avatar_upload_id?: string | null;
				system_avatar_template?: string;
				custom_avatar_upload_id?: number;
				custom_avatar_template?: string;
				muted_usernames: [];
				can_mute_users: boolean;
				ignored_usernames: [];
				can_ignore_users: boolean;
				allowed_pm_usernames: [];
				mailing_list_posts_per_day: number;
				can_change_bio: boolean;
				can_change_location: boolean;
				can_change_website: boolean;
				can_change_tracking_preferences: boolean;
				user_api_keys: null;
				user_passkeys: [];
				user_auth_tokens?: {
					id: number;
					client_ip: string;
					location: string;
					browser: string;
					device: string;
					os: string;
					icon: string;
					created_at: string;
					seen_at: string;
					is_active: boolean;
				}[];
				can_pick_theme_with_custom_homepage?: boolean;
				can_chat_user?: boolean;
				animated_avatar?: string | null;
				cakedate?: string;
				birthdate?: string;
				can_see_following?: boolean;
				can_see_followers?: boolean;
				can_see_network_tab?: boolean;
				can_follow?: boolean;
				is_followed: boolean;
				total_followers: number;
				total_following: number;
				notify_me_when_followed?: boolean;
				notify_followed_user_when_followed?: boolean;
				notify_me_when_followed_replies?: boolean;
				notify_me_when_followed_creates_topic?: boolean;
				allow_people_to_follow_me?: boolean;
				gamification_score?: number;
				vote_count?: number;
				can_use_saved_searches?: boolean;
				saved_searches?: string[];
				see_signatures?: boolean;
				accepted_answers?: number;
				featured_user_badge_ids?: number[];
				groups?: {
					id: number;
					automatic: boolean;
					name: string;
					display_name: string;
					user_count: number;
					mentionable_level: number;
					messageable_level: number;
					visibility_level: number;
					primary_group: boolean;
					title: unknown | null;
					grant_trust_level: unknown | null;
					has_messages: boolean;
					flair_url: unknown | null;
					flair_bg_color: unknown | null;
					flair_color: unknown | null;
					bio_cooked: string;
					bio_excerpt: string;
					public_admission: boolean;
					public_exit: boolean;
					allow_membership_requests: boolean;
					full_name: unknown | null;
					default_notification_level: number;
					membership_request_template: unknown | null;
					members_visibility_level: number;
					can_see_members: boolean;
					publish_read_state: boolean;
				}[];
				group_users?: {
					group_id: number;
					user_id: number;
					notification_level: number;
					owner: boolean;
				}[];
				user_option?: {
					user_id: number;
					mailing_list_mode: boolean;
					mailing_list_mode_frequency: number;
					email_digests: boolean;
					email_level: number;
					email_messages_level: number;
					external_links_in_new_tab: boolean;
					color_scheme_id: unknown | null;
					dark_scheme_id: unknown | null;
					dynamic_favicon: boolean;
					enable_quoting: boolean;
					enable_smart_lists: boolean;
					enable_defer: boolean;
					digest_after_minutes: number;
					automatically_unpin_topics: boolean;
					auto_track_topics_after_msecs: number;
					notification_level_when_replying: number;
					new_topic_duration_minutes: number;
					email_previous_replies: number;
					email_in_reply_to: boolean;
					like_notification_frequency: number;
					include_tl0_in_digests: boolean;
					theme_ids: number[];
					theme_key_seq: number;
					allow_private_messages: boolean;
					enable_allowed_pm_users: boolean;
					homepage_id: unknown | null;
					hide_profile_and_presence: boolean;
					hide_profile: boolean;
					hide_presence: boolean;
					text_size: string;
					text_size_seq: number;
					title_count_mode: string;
					bookmark_auto_delete_preference: number;
					timezone: string;
					skip_new_user_tips: boolean;
					default_calendar: string;
					oldest_search_log_date: unknown | null;
					seen_popups: number[];
					sidebar_link_to_filtered_list: boolean;
					sidebar_show_count_of_new_items: boolean;
					watched_precedence_over_muted: unknown | null;
					topics_unread_when_closed: boolean;
					chat_enabled: boolean;
					only_chat_push_notifications: unknown | null;
					ignore_channel_wide_mention: unknown | null;
					show_thread_title_prompts: boolean;
					chat_email_frequency: string;
					chat_header_indicator_preference: string;
					chat_separate_sidebar_mode: string;
					chat_send_shortcut: string;
					notification_level_when_assigned: string;
					policy_email_frequency: string;
				};
			};
	  })
	| null;

interface UserState {
	username: string;
	userData: UserData;
	isLoading: boolean;
	isInited: boolean;
	error: string | null;
	init: () => Promise<void>;
	refresh: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
	devtools(
		persist(
			(set, get) => ({
				username: "",
				userData: null,
				isLoading: false,
				isInited: false,
				error: null,

				init: async () => {
					const { isLoading, isInited, username, refresh } = get();
					if (isLoading || isInited) return;
					set({ isInited: true });

					const client = useLinuxDoClientStore.getState().client;
					if (!client) throw Error("Client not initialized, pos: useUserStore init");

					if (username === "") {
						const username = client.getUsername();
						if (username !== undefined) {
							set({ username });
							await refresh();
						}
					}

					client.onUsernameChanged(async (username) => {
						set({ username, userData: null });
						get().refresh();
					});
				},

				refresh: async () => {
					const { isLoading, username } = get();
					if (isLoading || !username) return;

					const client = useLinuxDoClientStore.getState().client;
					if (!client) throw Error("Client not initialized, pos: useUserStore refresh");

					set({ username: username, userData: null, isLoading: true, error: null });
					try {
						const userData = (await client.getUser({ username })) as UserData;
						set({
							username,
							userData,
							isLoading: false,
						});
					} catch (e) {
						console.error("ERROR: When getting user data", e);
						set({
							isLoading: false,
							error: "Failed to load user data",
						});
					}
				},
			}),
			{
				name: "user-storage",
				storage: createJSONStorage(() => AsyncStorage),
				partialize: (state) => ({ username: state.username, userData: state.userData }),
			},
		),
		{
			name: "user-store",
		},
	),
);
