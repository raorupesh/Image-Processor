import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { transformRequestSchema } from '../models/transform.js';
import { processImage } from '../services/imageProcessor.js';
import { HttpError } from '../middleware/errorHandler.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxUploadSizeBytes
  }
});

export const transformRouter = Router();

transformRouter.post('/transform', upload.single('image'), async (request, response, next) => {
  try {
    if (!request.file) {
      throw new HttpError(400, 'An image file is required');
    }

    if (!request.file.mimetype.startsWith('image/')) {
      throw new HttpError(415, 'Only image uploads are supported');
    }

    const operationsPayload = typeof request.body.operations === 'string' ? request.body.operations : '[]';
    const parsedOperations = transformRequestSchema.parse({
      operations: JSON.parse(operationsPayload)
    });

    const result = await processImage(request.file.buffer, parsedOperations.operations, request.file.originalname);

    response
      .status(200)
      .setHeader('Content-Type', result.contentType)
      .setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
      .setHeader('Cache-Control', 'no-store')
      .send(result.buffer);
  } catch (error) {
    if (error instanceof SyntaxError) {
      next(new HttpError(400, 'The operations payload must be valid JSON'));
      return;
    }

    next(error);
  }
});
