/**
 * Slim entry for the Quit Journey model: everything the shared UI uses,
 * without the Connect hooks (which depend on the browser reactor).
 */
export { actions } from "../../document-models/quit-journey/v1/actions.js";
export * from "../../document-models/quit-journey/v1/gen/index.js";
export * from "../../document-models/quit-journey/v1/src/index.js";
export { utils } from "../../document-models/quit-journey/v1/utils.js";
