import ApiUtils from './api/api-utils.js';
import Core from './gptk-core.js';

export const core = new Core();
export const apiUtils = new ApiUtils(core);