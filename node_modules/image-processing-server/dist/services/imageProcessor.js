import sharp from 'sharp';
function applyOperation(pipeline, operation) {
    switch (operation.type) {
        case 'flip':
            return operation.direction === 'vertical' ? pipeline.flip() : pipeline.flop();
        case 'grayscale':
            return pipeline.grayscale();
        case 'rotate':
            return operation.direction === 'left' ? pipeline.rotate(270) : pipeline.rotate(90);
        default: {
            const unreachable = operation;
            return unreachable;
        }
    }
}
export async function processImage(inputBuffer, operations, originalFilename) {
    let pipeline = sharp(inputBuffer);
    for (const operation of operations) {
        pipeline = applyOperation(pipeline, operation);
    }
    const buffer = await pipeline.png().toBuffer();
    const baseName = originalFilename ? originalFilename.replace(/\.[^.]+$/, '') : 'transformed-image';
    return {
        buffer,
        contentType: 'image/png',
        filename: `${baseName}-transformed.png`
    };
}
