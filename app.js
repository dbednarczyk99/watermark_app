const Jimp = require('jimp');
const inquirer = require('inquirer');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  };
  image.print(font, 10, 10, textData, image.getWidth(), image.getHeight());
  await image.quality(100).writeAsync(outputFile);
};

//addTextWatermarkToImage('./test.jpg', './test-with-watermark.jpg', 'Hello world');

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);

  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
};

//addImageWatermarkToImage('./test.jpg', './test-with-watermark2.jpg', './logo.png');

inquirer.prompt([
    {
    name: 'sourceFile',
    type: 'input',
    message: 'Enter the name of the source file.',
    }, {
    name: 'textOrImage',
    type: 'input',
    message: 'Do you want to insert image (I) or text (T)?'
    }, {
    name: 'watermarkContent',
    type: 'input',
    message: 'If you chose image insert the file name, otherwise insert the text.'
    }
]).then((answers) => {
    if (answers.textOrImage === 'I'){
        addImageWatermarkToImage( answers.sourceFile, './test-with-image-watermark.jpg', answers.watermarkContent );
    }
    else if (answers.textOrImage === 'T'){
        addTextWatermarkToImage( answers.sourceFile, './test-with-text-watermark.jpg', answers.watermarkContent )
    }
});