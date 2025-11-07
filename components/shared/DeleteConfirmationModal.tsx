/**
 * Delete Confirmation Modal - Modal de Confirmação de Exclusão
 * 
 * Modal genérico para confirmar exclusão de entidades
 */

import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  entityName,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-red-100 text-sm">Esta ação não pode ser desfeita</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{message}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Confirme a exclusão de:</p>
            <p className="text-lg font-bold text-gray-900">{entityName}</p>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Excluindo...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Confirmar Exclusão
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
