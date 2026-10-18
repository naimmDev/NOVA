import { useCallback, useEffect, useState } from 'react';

// Section navigation based on the URL hash (#agenda), without extra dependencies.
// `sections` must be a stable array defined outside the component.
export function useHashSection(sections) {
  const readSection = useCallback(() => {
    const id = window.location.hash.slice(1);
    return sections.some((section) => section.id === id) ? id : sections[0].id;
  }, [sections]);

  const [activeId, setActiveId] = useState(readSection);

  useEffect(() => {
    const handleHashChange = () => setActiveId(readSection());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [readSection]);

  return activeId;
}