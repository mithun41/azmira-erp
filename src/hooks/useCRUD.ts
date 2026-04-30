"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useCRUD<T>(baseUrl: string, createUrl: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await api.get(baseUrl, { params });
      setItems(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const create = async (data: Partial<T>) => {
    try {
      const res = await api.post(createUrl, data);
      toast.success("Created successfully");
      loadAll();
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data;
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg) || "Create failed");
      throw e;
    }
  };

  const update = async (id: number, data: Partial<T>, detailUrl: string) => {
    try {
      const res = await api.patch(detailUrl, data);
      toast.success("Updated successfully");
      loadAll();
      return res.data;
    } catch (e: any) {
      toast.error("Update failed");
      throw e;
    }
  };

  const remove = async (detailUrl: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await api.delete(detailUrl);
      toast.success("Deleted successfully");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  return { items, loading, loadAll, create, update, remove };
}
