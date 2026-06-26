import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtime(
  table: string,
  callback: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void,
  filter?: { column: string; value: string | number }
) {
  const handleCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter: `${filter.column}=eq.${filter.value}` } : {}),
        },
        (payload: unknown) => {
          handleCallback(payload as { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [table, filter, handleCallback]);
}
