// ==UserScript==
// @name         Google Photos web api response parser
// @version      2024-02-12
// @description  Userscript to parse and log web api response data
// @author       xob0t
// @match        *://photos.google.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

const logData = (url, data) => {
  const customRequest = !url.includes('&_reqid');
  try {
    // Split by line breaks and filter for lines containing "wrb.fr"
    const jsonLines = data.split('\n').filter((line) => line.includes('wrb.fr'));

    for (const line of jsonLines) {
      let parsedData = JSON.parse(line);
      const rpcid = parsedData[0][1];
      parsedData = JSON.parse(parsedData[0][2]);
      if (customRequest) {
        console.log('%c' + rpcid, 'background: blue; color: white; font-weight: bold;', parsedData);
      } else {
        console.log(rpcid, parsedData);
      }
    }
  } catch (error) {
    console.error(`${error}`);
  }
};

const logResponseData = (matches = []) => {
  const urlPatterns = ['PhotosUi/data/batchexecute', ...matches];

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url] = args;
    if (urlPatterns.some((pattern) => url.includes(pattern))) {
      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();
        const body = await clonedResponse.text();
        logData(url, body);
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    return originalFetch(...args);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (urlPatterns.some((pattern) => url.includes(pattern))) {
      this.addEventListener('load', function () {
        logData(url, this.responseText);
      });
      originalOpen.call(this, method, url);
      return;
    }
    originalOpen.apply(this, arguments);
  };
};

logResponseData();
