import { useEffect, useState } from 'react';

/**
 * Hook untuk menunda perubahan nilai hingga user berhenti mengetik.
 * @param value - Nilai yang akan di-debounce
 * @param delay - Waktu tunda dalam milidetik (ms)
 * @returns Nilai yang telah di-debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set timer untuk update nilai setelah delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup timer jika value berubah sebelum delay selesai
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}