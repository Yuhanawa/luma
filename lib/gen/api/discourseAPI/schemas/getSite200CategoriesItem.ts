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
import type { GetSite200CategoriesItemDescription } from './getSite200CategoriesItemDescription';
import type { GetSite200CategoriesItemDescriptionText } from './getSite200CategoriesItemDescriptionText';
import type { GetSite200CategoriesItemDescriptionExcerpt } from './getSite200CategoriesItemDescriptionExcerpt';
import type { GetSite200CategoriesItemTopicTemplate } from './getSite200CategoriesItemTopicTemplate';
import type { GetSite200CategoriesItemSubcategoryCount } from './getSite200CategoriesItemSubcategoryCount';
import type { GetSite200CategoriesItemSortOrder } from './getSite200CategoriesItemSortOrder';
import type { GetSite200CategoriesItemSortAscending } from './getSite200CategoriesItemSortAscending';
import type { GetSite200CategoriesItemDefaultView } from './getSite200CategoriesItemDefaultView';
import type { GetSite200CategoriesItemRequiredTagGroupsItem } from './getSite200CategoriesItemRequiredTagGroupsItem';
import type { GetSite200CategoriesItemReadOnlyBanner } from './getSite200CategoriesItemReadOnlyBanner';
import type { GetSite200CategoriesItemUploadedLogo } from './getSite200CategoriesItemUploadedLogo';
import type { GetSite200CategoriesItemUploadedLogoDark } from './getSite200CategoriesItemUploadedLogoDark';
import type { GetSite200CategoriesItemUploadedBackground } from './getSite200CategoriesItemUploadedBackground';
import type { GetSite200CategoriesItemUploadedBackgroundDark } from './getSite200CategoriesItemUploadedBackgroundDark';
import type { GetSite200CategoriesItemCustomFields } from './getSite200CategoriesItemCustomFields';

export type GetSite200CategoriesItem = {
  id: number;
  name: string;
  color: string;
  text_color: string;
  slug: string;
  topic_count: number;
  post_count: number;
  position: number;
  description?: GetSite200CategoriesItemDescription;
  description_text?: GetSite200CategoriesItemDescriptionText;
  description_excerpt?: GetSite200CategoriesItemDescriptionExcerpt;
  topic_url: string;
  read_restricted: boolean;
  permission: number;
  notification_level: number;
  topic_template: GetSite200CategoriesItemTopicTemplate;
  has_children: boolean;
  subcategory_count: GetSite200CategoriesItemSubcategoryCount;
  sort_order: GetSite200CategoriesItemSortOrder;
  sort_ascending: GetSite200CategoriesItemSortAscending;
  show_subcategory_list: boolean;
  num_featured_topics: number;
  default_view: GetSite200CategoriesItemDefaultView;
  subcategory_list_style: string;
  default_top_period: string;
  default_list_filter: string;
  minimum_required_tags: number;
  navigate_to_first_post_after_read: boolean;
  allowed_tags: unknown[];
  allowed_tag_groups: unknown[];
  allow_global_tags: boolean;
  required_tag_groups: GetSite200CategoriesItemRequiredTagGroupsItem[];
  read_only_banner: GetSite200CategoriesItemReadOnlyBanner;
  uploaded_logo: GetSite200CategoriesItemUploadedLogo;
  uploaded_logo_dark: GetSite200CategoriesItemUploadedLogoDark;
  uploaded_background: GetSite200CategoriesItemUploadedBackground;
  uploaded_background_dark: GetSite200CategoriesItemUploadedBackgroundDark;
  can_edit: boolean;
  custom_fields?: GetSite200CategoriesItemCustomFields;
  parent_category_id?: number;
  form_template_ids?: unknown[];
};
