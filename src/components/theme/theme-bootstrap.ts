// Runs before React hydration; the switch reads the resulting DOM state afterward.
export const themeBootstrap = `
  const root = document.documentElement;
  let savedTheme;
  try {
    savedTheme = localStorage.getItem('team-planner-theme');
  } catch {
    // Use the system preference when browser storage is unavailable.
  }
  const hasPreference = savedTheme === 'light' || savedTheme === 'dark';
  root.dataset.theme = hasPreference
    ? savedTheme
    : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  root.dataset.themePreference = hasPreference ? 'manual' : 'system';
`;
