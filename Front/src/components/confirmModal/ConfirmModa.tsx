import "./ConfirmModa.css";

type ConfirmModalProps = {
  isOpen: boolean;
  categoryName: string;
  subcategoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  categoryName,
  subcategoryName,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          ✕
        </button>

        <h2 className="modal-title">Confirmer la demande d'aide</h2>

        <p className="modal-text">Vous allez envoyer une demande pour :</p>

        <div className="modal-alert-info">
          <strong>
            {categoryName} → {subcategoryName}
          </strong>
        </div>

        <p className="modal-warning">
          Une alerte sera immédiatement transmise aux équipes de secours.
        </p>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
