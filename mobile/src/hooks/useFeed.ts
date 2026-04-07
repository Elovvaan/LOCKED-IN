import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFeed } from '../lib/skills';

export function useFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSince = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFeed();
      setPosts(data);
      if (data.length > 0) lastSince.current = data[0].createdAt;
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!lastSince.current) return;
    try {
      const data = await fetchFeed(lastSince.current);
      if (data.length > 0) {
        setPosts(prev => [...data, ...prev]);
        lastSince.current = data[0].createdAt;
      }
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [load, poll]);

  return { posts, loading, error, reload: load };
}
