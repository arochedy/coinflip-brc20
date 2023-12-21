"use server"
import fs from "fs";
import path from "path";

function getFoldersAndImages(directory: any) {
    const folderPath = path.join(process.cwd(), directory);

    try {
        const folders = fs
            .readdirSync(folderPath)
            .filter((file) => fs.statSync(path.join(folderPath, file)).isDirectory());

        const folderData = folders.map((folder) => {
            const folderImages = fs
                .readdirSync(path.join(folderPath, folder))
                .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
            return {
                folderName: folder,
                images: folderImages,
            };
        });

        return folderData;
    } catch (error: any) {
        console.error("Error reading directory:", error.message);
        return []; // Return an empty array to indicate an error or no folders/images
    }
}

export default getFoldersAndImages;