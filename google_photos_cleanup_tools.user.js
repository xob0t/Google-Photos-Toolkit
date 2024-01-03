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



const makeApiRequest = async (rpcids, requestData) => {
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
        console.error(`Error in ${rpcids} request:`, error);
        throw error;
    }
};


const getMediaAPI = async (timestamp = null) => {
    // Retrieve media items created before the provided timestamp
    const rpcids = "lcxiM";
    const limit = 500; // 500 max
    const requestData = [[[rpcids, `[null,${timestamp},${limit},null,1,1,${timestamp}]`, null, "generic"]]];
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in getMedia:', error);
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

const getAlbumsAPI = async () => {
    const rpcids = "Z5xsfc";
    const requestData = [[[rpcids, "[null,null,null,null,1,null,null,100]",null,"1"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in getAlbums:', error);
        throw error;
    }
};

const getTrashItemsAPI = async () => {
    const rpcids = "zy0IHe";
    const requestData = [[[rpcids,"[]",null,"1"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in getTrashItems:', error);
        throw error;
    }
};

const restoreFromTrashAPI = async (mediaIdList) => {
    const rpcids = "XwAOJf";
    const requestData = [[[rpcids,`[null,3,${JSON.stringify(mediaIdList)},2]`,null,"generic"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in restoreFromTrash:', error);
        throw error;
    }
};

const addMediaToAlbumAPI = async (productIdList, albumName = null, albumId = null) => {
    // supply album ID for moving into existing album, or a name for a new one
    const rpcids = "E1Cajb";
    let requestData = ''
    if (albumName){
        requestData = [[[rpcids,`[${JSON.stringify(productIdList)},null,\"${albumName}\"]`,null,"generic"]]]
    }
    else if (albumId){
        requestData = [[[rpcids,`[${JSON.stringify(productIdList)},\"${albumId}\"]`,null,"generic"]]]
    }
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in restoreFromTrash:', error);
        throw error;
    }
};

const addMediaToAlbum = async (name, productIdList) => {
    // check if there is an existing almum with the supplied name
    // if no albums match, create a new one
    const findAlbumByName = (albumList, searchString) => {
        const matchingObject = albumList.find(obj =>
            obj[8][72930366][1] === searchString
        );
        return matchingObject || null;
      }

    const albumList = await getAlbumsAPI()
    const targetAlbum = findAlbumByName(albumList, name)
    if (targetAlbum){
        console.log("adding media to an exisitng album")
        addMediaToAlbumAPI(albumId = targetAlbum[0], productIdList)
    }
    else{
        console.log("adding media to a new album")
        addMediaToAlbumAPI(albumName = name, productIdList)
    }
    
    
}

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

const getMediaSizeAPI = async (mediaPage) => {
    const rpcids = "EWgK9e";
    const extractedIDs = mediaPage[0].map(id => [id[0]]);
    const resultString = JSON.stringify(extractedIDs);

    const requestData = [[[rpcids, `[[[${resultString}],[[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,[]]]]]`, null, "generic"]]];

    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0][1];
    } catch (error) {
        console.error('Error in getMediaSize:', error);
        throw error;
    }
};

const moveMediaToTrashAPI = async (mediaIdList) => {
    const rpcids = "XwAOJf";
    const requestData = [[[rpcids, `[null,1,${JSON.stringify(mediaIdList)},3]`, null, "generic"]]];
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0][2];
    } catch (error) {
        console.error('Error in moveMediaToTrash:', error);
        throw error;
    }
};

async function logForTesting() {
    const mediaData = await addMediaToAlbum("newalbum1", ["AF1QipOu7e1cFa_SCsPgEBaBfhuvlR8ouj-G4EFxbNw","AF1QipPn_s9KnBp86EFUh3aDsj0vl06IVpXQHmn5AyE", "AF1QipMqTOLq6pDeqMsioQZ-aU6urM-fCGVuw9mfsOA"]);
    console.log('addMediaToaNewAlbum:', mediaData);
}

const deleteMediaTakingUpSpace = async () => {
    let nextTimestamp = null;
    console.log("deleteMediaTakingUpSpace")
    while (true) {
        const mediaPage = await getMediaAPI(nextTimestamp)
        nextTimestamp = parseInt(mediaPage[2]) - 1
        console.log('getMedia:', mediaPage);
        if (mediaPage && !mediaPage[0]) {
            console.log("no media to delete")
            return
        }
        const size = await getMediaSizeAPI(mediaPage)
        console.log(size)

        console.log("page deleted")
    }
}
logForTesting()


window.logForTesting = logForTesting;
//deleteMediaTakingUpSpace()

