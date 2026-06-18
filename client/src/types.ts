export type FlipDirection = 'horizontal' | 'vertical';
export type RotateDirection = 'left' | 'right';

export type TransformOperation =
  | { type: 'flip'; direction: FlipDirection }
  | { type: 'grayscale' }
  | { type: 'rotate'; direction: RotateDirection };

export type EditableOperation = TransformOperation & {
  id: string;
};
