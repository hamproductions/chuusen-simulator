import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, HStack, Stack } from 'styled-system/jsx';
import { ColorModeToggle } from '~/components/layout/ColorModeToggle';
import { Footer } from '~/components/layout/Footer';
import { LanguageToggle } from '~/components/layout/LanguageToggle';
import { Link } from '~/components/ui/link';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <Stack
      position="relative"
      w="full"
      minH="100vh"
      bgColor="bg.default"
      _print={{ minH: 'unset', gap: 0 }}
    >
      <Container
        zIndex="1"
        position="relative"
        flex={1}
        w="full"
        py={4}
        px={4}
        _print={{ maxW: 'unset', w: 'unset', padding: 0 }}
      >
        <Stack>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            w="full"
            flexWrap="wrap-reverse"
            _print={{ display: 'none' }}
          >
            <HStack>
              <Link href={'/'}>{t(`navigation.home`)}</Link>
            </HStack>
            <HStack justifySelf="flex-end">
              <LanguageToggle />
              <ColorModeToggle />
            </HStack>
          </HStack>
          {children}
        </Stack>
      </Container>
      <Footer />
    </Stack>
  );
}
