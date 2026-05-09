"use client";

import { ThemeProvider } from '@ledgerhq/lumen-ui-react';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider colorScheme="dark">
      {children}
    </ThemeProvider>
  );
}
