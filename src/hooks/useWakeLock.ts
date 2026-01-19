import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock() {
    const [isLocked, setIsLocked] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                const stream = await navigator.wakeLock.request('screen');
                wakeLockRef.current = stream;
                setIsLocked(true);

                stream.addEventListener('release', () => {
                    setIsLocked(false);
                });
            } catch (err) {
                console.error('Failed to acquire wake lock:', err);
                setIsLocked(false);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                setIsLocked(false);
            } catch (err) {
                console.error('Failed to release wake lock:', err);
            }
        }
    }, []);

    useEffect(() => {
        // Attempt to acquire lock on mount
        requestWakeLock();

        // Re-acquire on visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, [requestWakeLock, releaseWakeLock]);

    return { isLocked, requestWakeLock, releaseWakeLock };
}
