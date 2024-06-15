import Api from './api/api.js';
import ApiUtils from './api/api-utils.js';
import Core from './gptk-core.js';

export const core = new Core();
export const apiUtils = new ApiUtils(core);

// exposing api to be accesible globally
window.gptkApi = new Api();
window.gptkCore = core;
window.gptkApiUtils = apiUtils;
