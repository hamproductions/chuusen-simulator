import { createToaster } from '@ark-ui/react/toast';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

type ToastOptions = Parameters<typeof toaster.create>[0];
export const ToasterContext = createContext<{
  toast?: (msg: ReactNode, options?: ToastOptions) => void;
}>({});

export const toaster = createToaster({
  placement: 'bottom-end',
  max: 10,
  overlap: true
});

export const useToaster = () => useContext(ToasterContext);
