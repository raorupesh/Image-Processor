import sharp from 'sharp';
import type { TransformOperation } from '../types.js';

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

function applyOperation(pipeline: sharp.Sharp, operation: TransformOperation): sharp.Sharp {
  switch (operation.type) {
    case 'flip':
      return operation.direction === 'vertical' ? pipeline.flip() : pipeline.flop();
    case 'grayscale':
      return pipeline.grayscale();
    case 'rotate':
      return operation.direction === 'left' ? pipeline.rotate(270) : pipeline.rotate(90);
    default: {
      const unreachable: never = operation;
      return unreachable;
    }
  }
}

export async function processImage(
  inputBuffer: Buffer,
  operations: TransformOperation[],
  originalFilename?: string
): Promise<ProcessedImage> {
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
