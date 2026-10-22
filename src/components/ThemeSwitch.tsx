import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeSwitch() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme === 'dark',
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = (event: MediaQueryListEvent) => {
      if (document.documentElement.dataset.themePreference === 'system') {
        document.documentElement.dataset.theme = event.matches
          ? 'dark'
          : 'light';
        setIsDark(event.matches);
      }
    };

    media.addEventListener('change', followSystem);
    return () => media.removeEventListener('change', followSystem);
  }, []);

  function changeTheme(selected: boolean) {
    const theme = selected ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = 'manual';
    setIsDark(selected);

    try {
      localStorage.setItem('team-planner-theme', theme);
    } catch {
      // Keep the switch usable when browser storage is unavailable.
    }
  }

  return (
    <Switch aria-label="Dark mode" isSelected={isDark} onChange={changeTheme}>
      <Switch.Content className="min-h-11">
        <Switch.Control>
          <Switch.Thumb>
            <Switch.Icon>
              {isDark ? (
                <Moon size={12} aria-hidden="true" />
              ) : (
                <Sun size={12} aria-hidden="true" />
              )}
            </Switch.Icon>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}
