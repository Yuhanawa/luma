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
import type { AdminGetUser200Tl3RequirementsPenaltyCounts } from './adminGetUser200Tl3RequirementsPenaltyCounts';

export type AdminGetUser200Tl3Requirements = {
  time_period: number;
  requirements_met: boolean;
  requirements_lost: boolean;
  trust_level_locked: boolean;
  on_grace_period: boolean;
  days_visited: number;
  min_days_visited: number;
  num_topics_replied_to: number;
  min_topics_replied_to: number;
  topics_viewed: number;
  min_topics_viewed: number;
  posts_read: number;
  min_posts_read: number;
  topics_viewed_all_time: number;
  min_topics_viewed_all_time: number;
  posts_read_all_time: number;
  min_posts_read_all_time: number;
  num_flagged_posts: number;
  max_flagged_posts: number;
  num_flagged_by_users: number;
  max_flagged_by_users: number;
  num_likes_given: number;
  min_likes_given: number;
  num_likes_received: number;
  min_likes_received: number;
  num_likes_received_days: number;
  min_likes_received_days: number;
  num_likes_received_users: number;
  min_likes_received_users: number;
  penalty_counts: AdminGetUser200Tl3RequirementsPenaltyCounts;
};
