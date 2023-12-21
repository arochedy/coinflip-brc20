import fs from 'fs';
import path from 'path';
import sortImages from '@/utils/sortImages';
import { NextApiRequest } from 'next';

interface Image {
    type: string;
    name: string;
    path: string;
    directory: string;
}

interface Folder {
    name: string;
    path: string;
    images: Image[];
}

export async function GET(req: Request) {



    const items: Folder[] = [];
    let data: Folder[] = [];

    function traverse(currentDir: string) {
        const files = fs.readdirSync(currentDir);



        const folder: Folder = {
            name: path.basename(currentDir),
            path: `/${path.relative('./public', currentDir)}`,
            images: []
        };

        files.forEach(file => {
            const filePath = path.join(currentDir, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isDirectory()) {
                traverse(filePath);

            } else {
                if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)) {
                    const relativeImagePath = path.relative('/', filePath);
                    const image: Image = {
                        type: 'image',
                        name: file,
                        path: `/${relativeImagePath}`,
                        directory: `/static/img`
                    };
                    folder.images.push(image);
                }
            }
        });

        items.push(folder);

        data = items.filter(item => item.name !== 'img' && item.name !== 'badges' && item.name !== 'fav' && item.images.length);

        data = data.map(item => {
            if (item.images.length) {
                item.images = sortImages(item.images);
                return item
            }
            else {
                return item
            }
        })
    }

    traverse(path.join(process.cwd(), 'public', 'static/img'));



    return Response.json({ data: data, status: 200 })
}