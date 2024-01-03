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


const getMediaPageAPI = async (timestamp = null) => {
    // Retrieve media items created before the provided timestamp
    const rpcids = "lcxiM";
    const limit = 500; // 500 max, if null returns 300
    const requestData = [[[rpcids, JSON.stringify([null, timestamp, limit, null, 1, 1, timestamp]), null, "generic"]]];
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response;
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

const getTrashItemsAPI = async (pageId = null) => {
    const rpcids = "zy0IHe";
    const requestData = [[[rpcids, JSON.stringify([pageId]), null, "1"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response;
    } catch (error) {
        console.error('Error in getTrashItems:', error);
        throw error;
    }
};

const restoreFromTrashAPI = async (mediaIdList) => {
    const rpcids = "XwAOJf";
    const requestData = [[[rpcids, JSON.stringify([null, 3, mediaIdList, 2]), null, "generic"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in restoreFromTrash:', error);
        throw error;
    }
};

const restoreAllFromTrash = async () => {
    console.log("restoring trash");
    let trashItems, nextPageId = null;
    const restorePromises = [];
    do {
        [trashItems, nextPageId] = await getTrashItemsAPI(nextPageId);
        const mediaIdList = trashItems.map(item => item[3]);
        const restorePromise = restoreFromTrashAPI(mediaIdList);
        restorePromises.push(restorePromise);

    } while (nextPageId);

    await Promise.all(restorePromises);
    console.log("trash restored")
};

const getAlbumsAPI = async () => {
    const rpcids = "Z5xsfc";
    const requestData = [[[rpcids, "[null,null,null,null,1,null,null,100]", null, "1"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in getAlbums:', error);
        throw error;
    }
};

const addMediaToAlbumAPI = async (productIdList, albumName = null, albumId = null) => {
    // supply album ID for moving into existing album, or a name for a new one
    const rpcids = "E1Cajb";
    let requestData = ''

    if (albumName) {
        requestData = [[[rpcids, JSON.stringify([productIdList, null, albumName]), null, "generic"]]]
    }
    else if (albumId) {
        requestData = [[[rpcids, JSON.stringify([productIdList, albumId]), null, "generic"]]]
    }
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in addMediaToAlbumAPI:', error);
        throw error;
    }
};

const findAlbumByName = async (albumName) => {
    // returns the first album that matches the given name
    const albumList = await getAlbumsAPI()
    const matchingObject = albumList.find(obj =>
        obj[8][72930366][1] === albumName
    );
    return matchingObject || null;
}

const addMediaToAlbum = async (albumName, productIdList) => {
    // check if there is an existing album with the given name
    // if no matching album found, create a new one
    const targetAlbum = await findAlbumByName(albumName)
    if (targetAlbum) {
        console.log("adding media to an exisitng album", targetAlbum)
        addMediaToAlbumAPI(productIdList, null, targetAlbum[0])
    }
    else {
        console.log("adding media to a new album")
        addMediaToAlbumAPI(productIdList, albumName)
    }
};

const getMediaInfoAPI = async (productId) => {
    // get media info for a single media item by its product id
    const rpcids = "fDcn4b";
    const requestData = [[[rpcids, JSON.stringify([productId, 1]), null, "1"]]];
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0];
    } catch (error) {
        console.error('Error in getMediaInfoAPI:', error);
        throw error;
    }
};

const getAlbumMediaItemsAPI = async (albumId, pageId = null) => {
    // get media info for a single media by its product id
    const rpcids = "snAcKc";
    const requestData = [[[rpcids, JSON.stringify([albumId, pageId, null, null, 1]), null, "generic"]]]
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response;
    } catch (error) {
        console.error('Error in getAlbumMediaItems:', error);
        throw error;
    }
};

const trashAllMediaInAlbum = async (albumName) => {
    console.log(`deleting all media in the album ${albumName}`);
    const targetAlbum = await findAlbumByName(albumName);
    let nextPageId = null;
    const promises = [];
    do {
        const albumPage = await getAlbumMediaItemsAPI(targetAlbum[0], nextPageId);
        nextPageId = albumPage[2]
        const mediaIdList = albumPage[1].map(item => item[3]);
        const promise = moveMediaToTrashAPI(mediaIdList);
        promises.push(promise);

    } while (nextPageId);

    await Promise.all(promises);
    console.log("all media in the album moved to trash")
};

const identifyMediaOccupingSpace = async () => {
    // scans all library for media that occupies space
    // adds it to a "Occupies Space" album
    console.log("scanning for media occuping space");
    const promises = [];
    let mediaPage, timestamp = null;
    do {
        mediaPage = await getMediaPageAPI(timestamp);
        timestamp = parseInt(mediaPage[2]) - 1
        const productIdList = mediaPage[0].map(item => item[0]);
        const sizeData = await getMediaSizeAPI(productIdList)
        let idsOfMediaOccupingSpace = sizeData.filter(item => item[1][34][1] === 0).map(item => item[0]);
        const restorePromise = addMediaToAlbum("Occupies Space", idsOfMediaOccupingSpace);
        promises.push(restorePromise);

    } while (timestamp);
    await Promise.all(promises);
    console.log("all media occuping space added to \"Occupies Space\" album")
};

const getMediaSizeAPI = async (productIdList) => {
    // returns filename, size, occupied space
    const rpcids = "EWgK9e";
    productIdList = productIdList.map(id => [id]);

    const requestData = [[[rpcids, `[[[${JSON.stringify(productIdList)}],[[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,[]]]]]`, null, "generic"]]];

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
    const requestData = [[[rpcids, JSON.stringify([null, 1, mediaIdList, 3]), null, "generic"]]];
    try {
        const response = await makeApiRequest(rpcids, requestData);
        return response[0][2];
    } catch (error) {
        console.error('Error in moveMediaToTrash:', error);
        throw error;
    }
};

async function logForTesting() {
    // const trashPageId = "AH_uQ40j4o9d1CxS6pIcSMJX7hbC73hvC_CL62PcZ0_GOEr4i_xAb-fLhaHB1B-dD7VNlZjeKUwC1ESIOdIyAIzWu04BuM67RuouYsLF8DXGKK15tMNHB-qRFEIe4jKKTOfB_ubrAvlS"
    // const trash = await getTrashItemsAPI(trashPageId)
    const mediaData = await addMediaToAlbum("newalbum1", ["AF1QipOu7e1cFa_SCsPgEBaBfhuvlR8ouj-G4EFxbNw", "AF1QipPn_s9KnBp86EFUh3aDsj0vl06IVpXQHmn5AyE", "AF1QipMqTOLq6pDeqMsioQZ-aU6urM-fCGVuw9mfsOA"]);
    console.log('newalbum1:', mediaData);
}

const deleteMediaTakingUpSpace = async () => {
    let nextTimestamp = null;
    console.log("deleteMediaTakingUpSpace")
    while (true) {
        const mediaPage = await getMediaPageAPI(nextTimestamp)
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
//logForTesting()


window.restoreAllFromTrash = restoreAllFromTrash;
window.getMediaSizeAPI = getMediaSizeAPI;
window.moveMediaToTrashAPI = moveMediaToTrashAPI;
window.getMediaPageAPI = getMediaPageAPI;
window.addMediaToAlbumAPI = addMediaToAlbumAPI;
window.identifyMediaOccupingSpace = identifyMediaOccupingSpace;
window.trashAllMediaInAlbum = trashAllMediaInAlbum;

//deleteMediaTakingUpSpace()

