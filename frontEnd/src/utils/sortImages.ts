function sortImages(imagesArray: { name: string, type: string, path: string, directory: string }[]) {
    // Use the sort method to sort the array of objects based on the 'name' property
    imagesArray.sort((a, b) => {
        // Extract the numeric part from the 'name' property using regular expressions
        //@ts-ignore
        const numA = parseInt(a.name.match(/\d+/)[0], 10);
        //@ts-ignore
        const numB = parseInt(b.name.match(/\d+/)[0], 10);

        // Compare the numeric parts and return the comparison result
        return numA - numB;
    });

    return imagesArray;
}

export default sortImages