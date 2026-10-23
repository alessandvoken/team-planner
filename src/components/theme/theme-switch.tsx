'use client';

import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const followSystem = (event: MediaQueryListEvent) => {
    if (root.dataset.themePreference === 'system') {
      root.dataset.theme = event.matches ? 'dark' : 'light';
    }
  };
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  media.addEventListener('change', followSystem);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', followSystem);
  };
}

export function ThemeSwitch() {
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme === 'dark',
    () => false,
  );

  function changeTheme(selected: boolean) {
    const theme = selected ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = 'manual';

    try {
      localStorage.setItem('team-planner-theme', theme);
    } catch {
      // Keep the switch usable when browser storage is unavailable.
    }
  }

  return (
    <Switch
      size="lg"
      aria-label="Dark mode"
      isSelected={isDark}
      onChange={changeTheme}
    >
      <Switch.Content className="min-h-11">
        <Switch.Control>
          <Switch.Thumb>
            <Switch.Icon>
              {isDark ? (
                <Moon size={14} aria-hidden="true" />
              ) : (
                <Sun size={14} aria-hidden="true" />
              )}
            </Switch.Icon>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}
