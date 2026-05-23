import Api from './api/api';
import ApiUtils from './api/api-utils';
import Core from './gptk-core';

export const core = new Core();
export const apiUtils = new ApiUtils(core);

unsafeWindow.gptkApi = new Api();
unsafeWindow.gptkCore = core;
unsafeWindow.gptkApiUtils = apiUtils;
