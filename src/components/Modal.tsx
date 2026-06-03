import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border border-border-main bg-surface p-6 shadow-xl transition-all duration-300 focus:outline-none max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border-main pb-3 mb-4">
            <Dialog.Title className="text-lg font-bold font-heading text-text-main">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-text-muted hover:bg-canvas hover:text-text-main transition-colors cursor-pointer focus:outline-none"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="text-text-main text-sm">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
