interface ConfirmModalProps {
  id: string;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}

export default function ConfirmModal({ id, title, message, onConfirm, confirmLabel = 'Confirmar', confirmClass = 'btn-danger' }: ConfirmModalProps) {
  return (
    <div className="modal fade" id={id} tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" className={`btn ${confirmClass}`} data-bs-dismiss="modal" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
