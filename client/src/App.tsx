import { useEffect, useState, type FormEvent } from 'react';
import { transformImage } from './api';
import type { EditableOperation, TransformOperation } from './types';
import { OperationBuilder } from './components/OperationBuilder';

function createOperation(type: TransformOperation['type']): EditableOperation {
  const id = crypto.randomUUID();

  if (type === 'flip') {
    return { id, type, direction: 'horizontal' };
  }

  if (type === 'rotate') {
    return { id, type, direction: 'right' };
  }

  return { id, type };
}

function toApiOperations(operations: EditableOperation[]): TransformOperation[] {
  return operations.map(({ id, ...operation }) => operation);
}

export default function App() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [operations, setOperations] = useState<EditableOperation[]>([createOperation('flip'), createOperation('grayscale')]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>('transformed-image.png');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(sourceFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [sourceFile]);

  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  function addOperation(type: TransformOperation['type']) {
    setOperations((current) => [...current, createOperation(type)]);
  }

  function updateOperation(id: string, update: Partial<TransformOperation>) {
    setOperations((current) =>
      current.map((operation) => {
        if (operation.id !== id) {
          return operation;
        }

        return { ...operation, ...update } as EditableOperation;
      })
    );
  }

  function removeOperation(id: string) {
    setOperations((current) => current.filter((operation) => operation.id !== id));
  }

  function moveOperation(id: string, direction: 'up' | 'down') {
    setOperations((current) => {
      const index = current.findIndex((operation) => operation.id === id);
      if (index < 0) {
        return current;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [movedOperation] = next.splice(index, 1);
      next.splice(nextIndex, 0, movedOperation);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!sourceFile) {
      setErrorMessage('Choose an image file before transforming it.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { blob, filename } = await transformImage(sourceFile, toApiOperations(operations));
      const nextUrl = URL.createObjectURL(blob);

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      setResultUrl(nextUrl);
      setResultName(filename);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected transform failure');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero panel">
        <p className="eyebrow">Cloud-ready image processing</p>
        <h1>Compose image transforms in order and get an instant download.</h1>
        <p className="hero-copy">
          Upload a raster image, build an ordered pipeline, and let the Node.js API return a processed PNG without keeping a permanent copy of your file.
        </p>
      </section>

      <section className="workspace-grid">
        <form className="panel upload-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Source image</h2>
            </div>
          </div>

          <label className="file-dropzone">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSourceFile(event.target.files?.[0] ?? null)}
            />
            <span>{sourceFile ? sourceFile.name : 'Choose an image or drag one here'}</span>
          </label>

          {previewUrl && (
            <div className="preview-card">
              <img src={previewUrl} alt="Selected source preview" />
            </div>
          )}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Transforming...' : 'Run pipeline'}
          </button>

          {errorMessage && <p className="status status-error">{errorMessage}</p>}
          {resultUrl && <p className="status status-success">Ready: {resultName}</p>}
        </form>

        <OperationBuilder
          operations={operations}
          onAdd={addOperation}
          onUpdate={updateOperation}
          onRemove={removeOperation}
          onMove={moveOperation}
        />
      </section>

      <section className="panel result-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Output</p>
            <h2>Transformed preview</h2>
          </div>
        </div>

        {resultUrl ? (
          <>
            <div className="preview-card output-card">
              <img src={resultUrl} alt="Transformed result preview" />
            </div>
            <a className="primary-button download-link" href={resultUrl} download={resultName}>
              Download result
            </a>
          </>
        ) : (
          <div className="empty-state">Your processed image will appear here after the API finishes.</div>
        )}
      </section>
    </main>
  );
}
