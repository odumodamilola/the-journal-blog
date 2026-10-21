'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  articleTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({
  isOpen,
  articleTitle,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl transform transition-transform animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-error-container/40 flex items-center justify-center shrink-0 text-error">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-editorial-headline text-xl font-medium text-on-surface">
              Delete this article?
            </h3>
            <p className="text-xs leading-relaxed text-on-surface-variant mt-1.5">
              This action cannot be undone. The article{' '}
              <span className="font-semibold text-on-surface italic">
                &ldquo;{articleTitle}&rdquo;
              </span>{' '}
              and all associated subscriber reading progress will be permanently removed.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-outline-variant/40 text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-error text-on-error hover:bg-[#a01616] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Delete Article
          </button>
        </div>
      </div>
    </div>
  );
}
