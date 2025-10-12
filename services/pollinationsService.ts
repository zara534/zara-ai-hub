export const generateImageUrl = (prompt: string, model: string = 'flux', aspectRatio: string = '1:1'): string => {
    const encodedPrompt = encodeURIComponent(prompt);
    // Using seed to get different images and as a cache buster
    const seed = Math.floor(Math.random() * 1000000); 

    let width = 1024;
    let height = 1024;

    switch (aspectRatio) {
        case '16:9':
            width = 1280;
            height = 720;
            break;
        case '9:16':
            width = 720;
            height = 1280;
            break;
        case '4:3':
            width = 1024;
            height = 768;
            break;
        case '3:4':
            width = 768;
            height = 1024;
            break;
        case '1:1':
        default:
            width = 1024;
            height = 1024;
            break;
    }

    // Request high-resolution images, use a better model, and attempt to remove watermarks.
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nofeed=true&nolove=true`;
};
