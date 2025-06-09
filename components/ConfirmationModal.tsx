
import React from 'react';
import Modal from './Modal';
import TrashIcon from './icons/TrashIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-5">
          <TrashIcon className="h-8 w-8 text-error" />
        </div>
        <p className="text-base-content mb-8 text-lg">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-500 transition-colors shadow hover:shadow-md"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-6 py-2.5 text-sm font-medium text-error-content bg-error rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-error transition-colors shadow hover:shadow-md"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;