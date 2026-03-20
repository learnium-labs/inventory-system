"use client";

import { useEffect, useState } from "react";
import { getMasterBarang } from "@/lib/masterBarangApi";

// Module-level cache to prevent duplicate API calls across components
let masterBarangCache = null;
let masterBarangPromise = null;

export function useMasterBarang() {
  const [masterItems, setMasterItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMasterData() {
      setIsLoading(true);
      try {
        // If already cached, use it immediately
        if (masterBarangCache !== null) {
          setMasterItems(masterBarangCache);
          setIsLoading(false);
          return;
        }

        // If already loading, wait for the same promise
        if (masterBarangPromise !== null) {
          const data = await masterBarangPromise;
          setMasterItems(data);
          setIsLoading(false);
          return;
        }

        // First request - fetch and cache
        masterBarangPromise = getMasterBarang();
        const data = await masterBarangPromise;
        masterBarangCache = data;
        setMasterItems(data);
      } catch (err) {
        setError(err.message || "Gagal memuat master barang.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMasterData();
  }, []);

  return { masterItems, isLoading, error };
}
