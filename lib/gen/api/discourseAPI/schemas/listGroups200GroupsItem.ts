/**
 * Generated by orval v7.7.0 🍺
 * Do not edit manually.
 * Discourse API Documentation
 * This page contains the documentation on how to use Discourse through API calls.

> Note: For any endpoints not listed you can follow the
[reverse engineer the Discourse API](https://meta.discourse.org/t/-/20576)
guide to figure out how to use an API endpoint.

### Request Content-Type

The Content-Type for POST and PUT requests can be set to `application/x-www-form-urlencoded`,
`multipart/form-data`, or `application/json`.

### Endpoint Names and Response Content-Type

Most API endpoints provide the same content as their HTML counterparts. For example
the URL `/categories` serves a list of categories, the `/categories.json` API provides the
same information in JSON format.

Instead of sending API requests to `/categories.json` you may also send them to `/categories`
and add an `Accept: application/json` header to the request to get the JSON response.
Sending requests with the `Accept` header is necessary if you want to use URLs
for related endpoints returned by the API, such as pagination URLs.
These URLs are returned without the `.json` prefix so you need to add the header in
order to get the correct response format.

### Authentication

Some endpoints do not require any authentication, pretty much anything else will
require you to be authenticated.

To become authenticated you will need to create an API Key from the admin panel.

Once you have your API Key you can pass it in along with your API Username
as an HTTP header like this:

```
curl -X GET "http://127.0.0.1:3000/admin/users/list/active.json" \
-H "Api-Key: 714552c6148e1617aeab526d0606184b94a80ec048fc09894ff1a72b740c5f19" \
-H "Api-Username: system"
```

and this is how POST requests will look:

```
curl -X POST "http://127.0.0.1:3000/categories" \
-H "Content-Type: multipart/form-data;" \
-H "Api-Key: 714552c6148e1617aeab526d0606184b94a80ec048fc09894ff1a72b740c5f19" \
-H "Api-Username: system" \
-F "name=89853c20-4409-e91a-a8ea-f6cdff96aaaa" \
-F "color=49d9e9" \
-F "text_color=f0fcfd"
```

### Boolean values

If an endpoint accepts a boolean be sure to specify it as a lowercase
`true` or `false` value unless noted otherwise.

 * OpenAPI spec version: latest
 */
import type { ListGroups200GroupsItemTitle } from './listGroups200GroupsItemTitle';
import type { ListGroups200GroupsItemGrantTrustLevel } from './listGroups200GroupsItemGrantTrustLevel';
import type { ListGroups200GroupsItemIncomingEmail } from './listGroups200GroupsItemIncomingEmail';
import type { ListGroups200GroupsItemFlairUrl } from './listGroups200GroupsItemFlairUrl';
import type { ListGroups200GroupsItemFlairBgColor } from './listGroups200GroupsItemFlairBgColor';
import type { ListGroups200GroupsItemFlairColor } from './listGroups200GroupsItemFlairColor';
import type { ListGroups200GroupsItemBioRaw } from './listGroups200GroupsItemBioRaw';
import type { ListGroups200GroupsItemBioCooked } from './listGroups200GroupsItemBioCooked';
import type { ListGroups200GroupsItemBioExcerpt } from './listGroups200GroupsItemBioExcerpt';
import type { ListGroups200GroupsItemFullName } from './listGroups200GroupsItemFullName';
import type { ListGroups200GroupsItemMembershipRequestTemplate } from './listGroups200GroupsItemMembershipRequestTemplate';

export type ListGroups200GroupsItem = {
  id: number;
  automatic: boolean;
  name: string;
  display_name: string;
  user_count: number;
  mentionable_level: number;
  messageable_level: number;
  visibility_level: number;
  primary_group: boolean;
  title: ListGroups200GroupsItemTitle;
  grant_trust_level: ListGroups200GroupsItemGrantTrustLevel;
  incoming_email: ListGroups200GroupsItemIncomingEmail;
  has_messages: boolean;
  flair_url: ListGroups200GroupsItemFlairUrl;
  flair_bg_color: ListGroups200GroupsItemFlairBgColor;
  flair_color: ListGroups200GroupsItemFlairColor;
  bio_raw: ListGroups200GroupsItemBioRaw;
  bio_cooked: ListGroups200GroupsItemBioCooked;
  bio_excerpt: ListGroups200GroupsItemBioExcerpt;
  public_admission: boolean;
  public_exit: boolean;
  allow_membership_requests: boolean;
  full_name: ListGroups200GroupsItemFullName;
  default_notification_level: number;
  membership_request_template: ListGroups200GroupsItemMembershipRequestTemplate;
  is_group_user?: boolean;
  is_group_owner?: boolean;
  members_visibility_level: number;
  can_see_members: boolean;
  can_admin_group: boolean;
  can_edit_group?: boolean;
  publish_read_state: boolean;
};
