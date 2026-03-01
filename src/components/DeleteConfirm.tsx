import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false,
}: DeleteConfirmProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6" role="alertdialog" aria-describedby="delete-description">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 rounded-full" aria-hidden="true">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2" id="delete-description">
          <p className="text-text-secondary">{description}</p>
          {itemName && (
            <p className="text-text-primary font-medium bg-surface-lighter px-3 py-2 rounded-lg inline-block">
              <span className="sr-only">Item to delete: </span>"{itemName}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center" role="group" aria-label="Confirmation actions">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="btn-secondary min-w-[100px]"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg
                     hover:bg-red-400 active:bg-red-600
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     min-w-[100px] flex items-center justify-center gap-2"
            aria-label={isDeleting ? 'Deleting item' : `Delete ${itemName || 'item'}`}
            aria-busy={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
