/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as deliveryAnalyses from "../deliveryAnalyses.js";
import type * as generationEvents from "../generationEvents.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_projectRules from "../lib/projectRules.js";
import type * as procurementPackages from "../procurementPackages.js";
import type * as projectProfiles from "../projectProfiles.js";
import type * as projects from "../projects.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  deliveryAnalyses: typeof deliveryAnalyses;
  generationEvents: typeof generationEvents;
  "lib/auth": typeof lib_auth;
  "lib/projectRules": typeof lib_projectRules;
  procurementPackages: typeof procurementPackages;
  projectProfiles: typeof projectProfiles;
  projects: typeof projects;
  users: typeof users;
  workspaces: typeof workspaces;
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
