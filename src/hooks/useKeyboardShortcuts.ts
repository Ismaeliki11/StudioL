import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutMap {
    [key: string]: KeyHandler;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, disabled: boolean = false) {
    useEffect(() => {
        if (disabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // Special handling for arrow keys causing scrolling
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) && shortcuts[e.key]) {
                e.preventDefault();
            }

            const handler = shortcuts[key] || shortcuts[e.key];
            if (handler) {
                handler(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, disabled]);
}
