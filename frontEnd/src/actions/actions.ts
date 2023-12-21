"use server"

import fs from "fs"
const getRewardImages = async () => {
    let folderdata = []
    const folderLists = await fs.promises.readdir('/static/img', { withFileTypes: true });
    const folderNameList = folderLists.filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    if (folderNameList.length) {
        for (let i = 0; i < folderNameList.length; i++) {
            const folderName = folderNameList[i]
            const imageList = await fs.promises.readdir(`/static/img/${folderName}`);
            folderdata.push({ folderName, imageList })
        }
        folderdata = folderdata.filter(item => item.folderName !== "badges" && item.folderName !== "bitmap")

        return folderdata
    }
}

export { getRewardImages }