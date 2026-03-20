"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_USERNAME,
  AUTH_PASSWORD,
  getAuthSession,
  setAuthSession,
} from "@/lib/authClient";

async function getSwal() {
  const module = await import("sweetalert2");
  return module.default;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (session?.isLoggedIn) {
      router.replace("/");
    }
  }, [router]);

  async function onSubmit(event) {
    event.preventDefault();
    const Swal = await getSwal();

    if (!username.trim() || !password) {
      await Swal.fire({
        icon: "warning",
        title: "Validasi",
        text: "Username dan password wajib diisi.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isValid =
        username.trim() === AUTH_USERNAME && password === AUTH_PASSWORD;

      if (!isValid) {
        await Swal.fire({
          icon: "error",
          title: "Login gagal",
          text: "Username atau password salah.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      setAuthSession(username.trim());

      await Swal.fire({
        icon: "success",
        title: "Login berhasil",
        text: "Selamat datang di dashboard.",
        confirmButtonColor: "#2563eb",
      });

      router.replace("/");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Login Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Masuk untuk melanjutkan ke Inventory Management.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan username"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Memproses..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
