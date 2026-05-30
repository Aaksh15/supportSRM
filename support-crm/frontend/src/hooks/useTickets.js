import { useEffect, useState } from "react";

import { getTickets } from "../services/api.js";

export default function useTickets(query = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadTickets() {
      try {
        setLoading(true);
        setError("");
        const data = await getTickets({ ...query, signal: controller.signal });
        setTickets(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Backend is not running or the API cannot be reached.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
    return () => controller.abort();
  }, [query.search, query.status]);

  return { tickets, loading, error, setTickets };
}
