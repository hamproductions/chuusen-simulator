import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { toaster, ToasterContext } from './ToasterContext';
import { IconButton } from '~/components/ui/icon-button';
import { Toast } from '~/components/ui/toast';

export function ToasterProvider({ children }: { children: ReactNode }) {
  return (
    <ToasterContext.Provider
      value={{
        toast: (message, options) => {
          toaster.create({
            description: message,
            type: 'info',
            ...options
          });
        }
      }}
    >
      {children}
      <Suspense>
        <Toast.Toaster toaster={toaster}>
          {(toast) => {
            return (
              <Toast.Root>
                <Toast.Title>{toast.title}</Toast.Title>
                <Toast.Description>{toast.description}</Toast.Description>
                <Toast.CloseTrigger asChild>
                  <IconButton size="sm" variant="link">
                    <FaXmark />
                  </IconButton>
                </Toast.CloseTrigger>
              </Toast.Root>
            );
          }}
        </Toast.Toaster>
      </Suspense>
    </ToasterContext.Provider>
  );
}
