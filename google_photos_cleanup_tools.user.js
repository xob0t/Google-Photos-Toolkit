// ==UserScript==
// @name         Fast Google Photos Cleaner
// @namespace    http://tampermonkey.net/
// @version      2024-01-03
// @description  Cleans your Google Photos blazingly fast and with configurable options
// @author       You
// @match        https://photos.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=photos.google.com
// @grant        none
// @run-at       document-end
// @require      file:///C:/Users/admin/Documents/GitHub/delete-photos/google_photos_cleanup_tools.user.js
// @noframes

// ==/UserScript==



const getMedia = async (timestamp = null) => {
    // Retrieve media items created before the provided timestamp
    const rpcids = "lcxiM";
    const limit = 500; // 500 max
    const requestData = [[[rpcids, `[null,${timestamp},${limit},null,1,1,${timestamp}]`, null, "generic"]]];
    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(window.WIZ_global_data.SNlM0e)}&`;
    const url = `https://photos.google.com${window.WIZ_global_data.eptZe}data/batchexecute?rpcids=${rpcids}&f.sid=${window.WIZ_global_data.FdrFJe}`;
    try {
        const response = await fetch(url, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            "body": requestDataString,
            "method": "POST",
            "credentials": "include"
        });

        const responseBody = await response.text();
        const jsonResponse = responseBody.substring(responseBody.indexOf('['));
        let parsedResponse = JSON.parse(jsonResponse);
        parsedResponse = JSON.parse(parsedResponse[0][2]);
        return parsedResponse;
    } catch (error) {
        console.error('getMedia Error:', error);
        throw error;
    }
};



const parseMediaPage = (mediaPage) => {
    const mediaList = mediaPage[0];
    const lastTimestamp = mediaPage[2];
    for (const media of mediaList) {
        const mediaObject = {
            productId: media[0],
            thumnailData: { // not sure about that name
                thumbUrl: media[1][0],
                width: media[1][1],
                height: media[1][2]
            },
            mediaCreationTimestamp: media[2],
            mediaId: media[3],
            mediaUploadTimestamp: media[5],
            name7: media[6],
            name8: media[7],
            name9: media[8],
            name10: media[9],
            name11: media[10],
            name12: media[11],
            name13: media[12],
            name14: media[13],
            name15: media[14],
            mediaInfo: media[15],
            name17: media[16],
            name18: media[17],
            name19: media[18],
            name20: media[19],
            name21: media[20],
            name22: media[21]
        };
    }

};

const getAlbums = async () => {
    const rpcids = "Z5xsfc";
    const requestData = [[[rpcids,"[null,null,null,null,1,null,null,100]",null,"1"]]];

    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(window.WIZ_global_data.SNlM0e)}&`;
    const url = `https://photos.google.com${window.WIZ_global_data.eptZe}data/batchexecute?rpcids=${rpcids}&f.sid=${window.WIZ_global_data.FdrFJe}`;
    try {
        const response = await fetch(url, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            "body": requestDataString,
            "method": "POST",
            "credentials": "include"
        });

        const responseBody = await response.text();
        const jsonResponse = responseBody.substring(responseBody.indexOf('['));
        let parsedResponse = JSON.parse(jsonResponse);
        parsedResponse = JSON.parse(parsedResponse[0][2]);
        return parsedResponse;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

fetch("https://photos.google.com/u/2/_/PhotosUi/data/batchexecute?rpcids=Z5xsfc&source-path=%2Fu%2F2%2Falbums&f.sid=4036024624387355762&bl=boq_photosuiserver_20231217.04_p1&hl=ru&soc-app=165&soc-platform=1&soc-device=1&_reqid=1433634&rt=c", {
  "headers": {
    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
  },
  "body": "f.req=%5B%5B%5B%22Z5xsfc%22%2C%22%5Bnull%2Cnull%2Cnull%2Cnull%2C1%2Cnull%2Cnull%2C100%5D%22%2Cnull%2C%221%22%5D%5D%5D&at=AMte4lXSzqC_RcmbRKeFC-JrTeJ4%3A1704262834098&",
  "method": "POST",
  "credentials": "include"
});

// restore from trash
// fetch("https://photos.google.com/u/2/_/PhotosUi/data/batchexecute?rpcids=XwAOJf&source-path=%2Fu%2F2%2Ftrash&f.sid=7197950484839168837&bl=boq_photosuiserver_20231217.04_p1&hl=ru&soc-app=165&soc-platform=1&soc-device=1&_reqid=7911303&rt=c", {
//   "headers": {
//     "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
//   },
//   "body": "f.req=%5B%5B%5B%22XwAOJf%22%2C%22%5Bnull%2C3%2C%5B%5C%22eUcTwnOSjTnE29ORD8Fa9-Kihtg%5C%22%5D%2C2%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AMte4lWBMNjJ3vZrPef9y9QiePd5%3A1704240502161&",
//   "method": "POST",
//   "credentials": "include"
// });

// get trash items
//fetch("https://photos.google.com/u/2/_/PhotosUi/data/batchexecute?rpcids=zy0IHe&source-path=%2Fu%2F2%2Ftrash&f.sid=7197950484839168837&bl=boq_photosuiserver_20231217.04_p1&hl=ru&soc-app=165&soc-platform=1&soc-device=1&_reqid=7811303&rt=c", {
//   "headers": {
//     "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
//   },
//   "body": "f.req=%5B%5B%5B%22zy0IHe%22%2C%22%5B%5D%22%2Cnull%2C%221%22%5D%5D%5D&at=AMte4lWBMNjJ3vZrPef9y9QiePd5%3A1704240502161&",
//   "method": "POST",
//   "credentials": "include"
// });

// add media to a new album
//fetch("https://photos.google.com/u/2/_/PhotosUi/data/batchexecute?rpcids=E1Cajb&source-path=%2Fu%2F2%2F&f.sid=8553615170827615654&bl=boq_photosuiserver_20231217.04_p1&hl=ru&soc-app=165&soc-platform=1&soc-device=1&_reqid=4609404&rt=c", {
//   "headers": {
//     "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
//   },
//   "body": "f.req=%5B%5B%5B%22E1Cajb%22%2C%22%5B%5B%5C%22AF1QipNxQhUzwtBz3szRApVYsBmHkTyREPb4KKwW3hI%5C%22%2C%5C%22AF1QipML49wK1ZcZdRGkqREkF6KEINMbjbgOjx7S1_M%5C%22%2C%5C%22AF1QipOu7e1cFa_SCsPgEBaBfhuvlR8ouj-G4EFxbNw%5C%22%2C%5C%22AF1QipO-rQswDWZvH4mfRdCA7u4CVmHlCCasv2A2aN8%5C%22%5D%2Cnull%2C%5C%22%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%5C%22%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AMte4lW0eRZi7xC8Jue2nBlEbxwQ%3A1704238604091&",
//   "method": "POST",
//   "credentials": "include"
// });

// get media info by id
// fetch("https://photos.google.com/u/0/_/PhotosUi/data/batchexecute?rpcids=fDcn4b&source-path=%2Fu%2F0%2Fphoto%2FAF1QipODG_3h9KPwBXVJHaRxu7RTOK1bi52vtOTFWCGQ&f.sid=1480257426694425772&bl=boq_photosuiserver_20231217.04_p1&hl=ru&soc-app=165&soc-platform=1&soc-device=1&_reqid=1640372&rt=c", {
//     "headers": {
//         "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
//     },
//     "body": "f.req=%5B%5B%5B%22fDcn4b%22%2C%22%5B%5C%22AF1QipODG_3h9KPwBXVJHaRxu7RTOK1bi52vtOTFWCGQ%5C%22%2C1%5D%22%2Cnull%2C%221%22%5D%5D%5D&at=AMte4lXI-nfAuvjpeDZpLWR_q1Pb%3A1704183173180&",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
// });

const getMediaSize = async (mediaPage) => {
    // Retrieve media items created before the provided timestamp
    const rpcids = "EWgK9e";
    const extractedIDs = mediaPage[0].map(id => [id[0]]);
    const resultString = JSON.stringify(extractedIDs);

    const requestData = [[[rpcids,`[[[${resultString}],[[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,[]]]]]`,null,"generic"]]];

    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(window.WIZ_global_data.SNlM0e)}&`;
    const url = `https://photos.google.com${window.WIZ_global_data.eptZe}data/batchexecute?rpcids=${rpcids}&f.sid=${window.WIZ_global_data.FdrFJe}`;
    try {
        const response = await fetch(url, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            "body": requestDataString,
            "method": "POST",
            "credentials": "include"
        });

        const responseBody = await response.text();
        const jsonResponse = responseBody.substring(responseBody.indexOf('['));
        let parsedResponse = JSON.parse(jsonResponse);
        parsedResponse = JSON.parse(parsedResponse[0][2])[0][1];
        return parsedResponse;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const moveMediaToTrash = async (mediaIdList) => {
    const rpcids = "XwAOJf";
    const requestData = [[[rpcids, `[null,1,${JSON.stringify(mediaIdList)},3]`, null, "generic"]]];

    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(window.WIZ_global_data.SNlM0e)}&`;
    const url = `https://photos.google.com${window.WIZ_global_data.eptZe}data/batchexecute?rpcids=${rpcids}&f.sid=${window.WIZ_global_data.FdrFJe}`;

    try {
        const response = await fetch(url, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            "body": requestDataString,
            "method": "POST",
            "credentials": "include"
        });

        const responseBody = await response.text();
        const jsonResponse = responseBody.substring(responseBody.indexOf('['));
        let parsedResponse = JSON.parse(jsonResponse);
        parsedResponse = JSON.parse(parsedResponse[0][2]);
        return parsedResponse;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

async function logMediaData() {
    const mediaData = await getMedia();
    console.log('getMedia:', mediaData);
}

const deleteMediaTakingUpSpace = async () => {
    let nextTimestamp = null;
    console.log("deleteMediaTakingUpSpace")
    while (true){
        const mediaPage = await getMedia(nextTimestamp)
        nextTimestamp = parseInt(mediaPage[2])-1
        console.log('getMedia:', mediaPage);
        if (mediaPage && !mediaPage[0]){
            console.log("no media to delete")
            return
        }
        const size = await getMediaSize(mediaPage)
        console.log(size)

        console.log("page deleted")
    }
}


logMediaData()
window.logMediaData = logMediaData;
//deleteMediaTakingUpSpace()

