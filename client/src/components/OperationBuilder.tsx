import type { EditableOperation, FlipDirection, RotateDirection, TransformOperation } from '../types';

interface OperationBuilderProps {
  operations: EditableOperation[];
  onAdd: (type: TransformOperation['type']) => void;
  onUpdate: (id: string, operation: Partial<TransformOperation>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const operationLabels: Record<TransformOperation['type'], string> = {
  flip: 'Flip',
  grayscale: 'Grayscale',
  rotate: 'Rotate'
};

export function OperationBuilder({ operations, onAdd, onUpdate, onRemove, onMove }: OperationBuilderProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h2>Ordered transforms</h2>
        </div>
        <div className="button-row">
          <button type="button" className="ghost-button" onClick={() => onAdd('flip')}>
            Add flip
          </button>
          <button type="button" className="ghost-button" onClick={() => onAdd('grayscale')}>
            Add grayscale
          </button>
          <button type="button" className="ghost-button" onClick={() => onAdd('rotate')}>
            Add rotate
          </button>
        </div>
      </div>

      <div className="operation-list">
        {operations.length === 0 ? (
          <div className="empty-state">No operations yet. Add one to define the transformation order.</div>
        ) : (
          operations.map((operation, index) => (
            <div className="operation-card" key={operation.id}>
              <div className="operation-meta">
                <span className="operation-index">{index + 1}</span>
                <strong>{operationLabels[operation.type]}</strong>
              </div>

              <div className="operation-controls">
                {operation.type === 'flip' && (
                  <label>
                    Direction
                    <select
                      value={operation.direction}
                      onChange={(event) => onUpdate(operation.id, { direction: event.target.value as FlipDirection })}
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </label>
                )}

                {operation.type === 'rotate' && (
                  <label>
                    Direction
                    <select
                      value={operation.direction}
                      onChange={(event) => onUpdate(operation.id, { direction: event.target.value as RotateDirection })}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                )}
              </div>

              <div className="operation-actions">
                <button type="button" className="icon-button" onClick={() => onMove(operation.id, 'up')} disabled={index === 0}>
                  ↑
                </button>
                <button type="button" className="icon-button" onClick={() => onMove(operation.id, 'down')} disabled={index === operations.length - 1}>
                  ↓
                </button>
                <button type="button" className="danger-button" onClick={() => onRemove(operation.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
