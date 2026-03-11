function extractAllCssVarsFromStylesheets(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      if ((styleSheet.href && new URL(styleSheet.href).origin !== location.origin) || !styleSheet.cssRules) {
        continue;
      }

      for (const rule of Array.from(styleSheet.cssRules)) {
        if (rule.type === CSSRule.STYLE_RULE) {
          const styleRule = rule as CSSStyleRule;
          if (styleRule?.selectorText === ':root') {
            const style = styleRule.style;

            for (const name of Array.from(style)) {
              if (name.startsWith('--')) {
                result[name] = style.getPropertyValue(name).trim();
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error accessing stylesheet rules:', e);
      continue;
    }
  }
  return result;
}

export function getCssVar() {
  const rootStyles = extractAllCssVarsFromStylesheets();
  const cssVars: Record<string, string> = {};

  Object.entries(rootStyles).forEach(([key, value]) => {
    const camelName = key
      .replace(/^--/, '')
      .split('-')
      .map((s, idx) => (idx === 0 ? s : s[0].toUpperCase() + s.slice(1)))
      .join('');
    cssVars[camelName] = value;
  });

  return cssVars;
}
