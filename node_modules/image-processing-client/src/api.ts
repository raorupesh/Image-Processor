import type { TransformOperation } from './types';

interface TransformResult {
  blob: Blob;
  filename: string;
}

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const filenameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return filenameMatch ? filenameMatch[1] : null;
}

export async function transformImage(file: File, operations: TransformOperation[]): Promise<TransformResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('operations', JSON.stringify(operations));

  const response = await fetch('/api/transform', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Unable to transform image');
  }

  const blob = await response.blob();
  const filename = parseFilename(response.headers.get('content-disposition')) ?? 'transformed-image.png';

  return { blob, filename };
}
