import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorModeProvider } from '~/context/ColorModeContext';
import { Layout } from '~/pages/+Layout';

import '../../i18n';
import { ToasterProvider } from '~/context/ToasterProvider';

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <ToasterProvider>
        <Layout>{children}</Layout>
      </ToasterProvider>
    </ColorModeProvider>
  );
}

const customRender = async (ui: React.ReactNode, options?: RenderOptions) => {
  const user = userEvent.setup();
  const res = render(ui, { wrapper: AllTheProviders, ...options });
  await user.click(await res.findByText('English'));
  return [res, user] as const;
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
