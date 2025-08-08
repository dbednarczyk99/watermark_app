const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('node:fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text, modificationType) {
    try {
        let image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        };
        if(modificationType){
            image = imageModification(image, modificationType);
        }
        image.print(font, 10, 10, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);
        console.log('✅ Success! Your photo has been successfully marked.');
        startApp();
    }
    catch {
        console.log('❌ [addTextWatermarkToImage] Something went wrong... Try again.');
        startApp();
    }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile, modificationType) {
    try {
        let image = await Jimp.read(inputFile);
        const watermark = await Jimp.read(watermarkFile);
        if(modificationType){
            image = imageModification(image, modificationType);
        }
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);
        console.log('✅ Success! Your photo has been successfully marked.');
        startApp();
    }
    catch(error) {
        console.log('❌ [addImageWatermarkToImage] Something went wrong... Try again.');
        startApp();
    }
};

const imageModification = (image, modificationType) => {
        switch (modificationType) {
            case 'make image brighter':
                image.brightness(.5);
                break;
            case 'increase contrast':
                image.contrast(.5);
                break;
            case 'make image b&w':
                image.grayscale();
                break;
            case 'invert image':
                image.invert();
                break;
        }
        return image;
}

const prepareOutputFilename = (input, type) => {
    const array = input.split('.');
    return `${array[0]}-with-${type}-watermark.${array[1]}`;
};

const startApp = async () => {

    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
    }]);

    if(!answer.start) process.exit();

    const imageInput = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message: 'What file do you want to mark?',
        default: 'test.jpg',
    }, {
        name: 'modRequest',
        message: 'Would you like to edit the source file?',
        type: 'confirm',
    }]);

    let modificationType = null;
    if(imageInput.modRequest) {
        const modType = await inquirer.prompt([{
            name: 'modificationType',
            type: 'list',
            choices: ['make image brighter', 'increase contrast', 'make image b&w', 'invert image']
        }])
        modificationType = modType.modificationType;
    }
    
    const watermarkInput = await inquirer.prompt([{
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark'],
    }]);

    if(watermarkInput.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
            name: 'value',
            type: 'input',
            message: 'Type your watermark text:',
        }]);
        imageInput.watermarkText = text.value;
        //console.log(prepareOutputFilename(options.inputImage));
        if(fs.existsSync(`./img/${imageInput.inputImage}`)){
            addTextWatermarkToImage('./img/' + imageInput.inputImage, './img/' + prepareOutputFilename(imageInput.inputImage, 'text'), imageInput.watermarkText, modificationType);
        }
        else {
            console.log(`❌ File "./img/${imageInput.inputImage}" not found... Try again.`);
            startApp();
        }
    }
    else {
        const image = await inquirer.prompt([{
            name: 'filename',
            type: 'input',
            message: 'Type your watermark name:',
            default: 'logo.png',
        }]);
        imageInput.watermarkImage = image.filename;
   
        if(fs.existsSync(`./img/${imageInput.inputImage}`)) {
            if(fs.existsSync(`./img/${imageInput.watermarkImage}`)){
                addImageWatermarkToImage('./img/' + imageInput.inputImage, './img/' + prepareOutputFilename(imageInput.inputImage, 'image'), './img/' + imageInput.watermarkImage, modificationType);
            }
            else {
                console.log(`❌ File "./img/${imageInput.watermarkImage}" not found... Try again.`);
                startApp();
            }
        }
        else {
            console.log(`❌ File "./img/${imageInput.inputImage}" not found... Try again.`);
            startApp();
        }
    }
}

startApp();