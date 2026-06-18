import { z } from 'zod';
export const flipOperationSchema = z.object({
    type: z.literal('flip'),
    direction: z.enum(['horizontal', 'vertical']),
});
export const grayscaleOperationSchema = z.object({
    type: z.literal('grayscale'),
});
export const rotateOperationSchema = z.object({
    type: z.literal('rotate'),
    direction: z.enum(['left', 'right']),
});
export const transformOperationSchema = z.discriminatedUnion('type', [
    flipOperationSchema,
    grayscaleOperationSchema,
    rotateOperationSchema,
]);
export const transformRequestSchema = z.object({
    operations: z.array(transformOperationSchema).default([]),
});
