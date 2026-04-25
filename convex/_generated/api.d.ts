/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLogs from "../activityLogs.js";
import type * as chat from "../chat.js";
import type * as gemini from "../gemini.js";
import type * as logs from "../logs.js";
import type * as messages from "../messages.js";
import type * as moodLogs from "../moodLogs.js";
import type * as sleepLogs from "../sleepLogs.js";
import type * as stressLogs from "../stressLogs.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  chat: typeof chat;
  gemini: typeof gemini;
  logs: typeof logs;
  messages: typeof messages;
  moodLogs: typeof moodLogs;
  sleepLogs: typeof sleepLogs;
  stressLogs: typeof stressLogs;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
