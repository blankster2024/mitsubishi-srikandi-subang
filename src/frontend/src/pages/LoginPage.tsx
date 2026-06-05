import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { clearAuthToken, syncAuthToken } from "../utils/apiClient";

export default function LoginPage() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor } = useActor();
  const [whoAmILoading, setWhoAmILoading] = useState(false);

  const isAuthenticated =
    !!identity && identity.getPrincipal().toString() !== "2vxsx-fae";
  const isLoggingIn = loginStatus === "logging-in";

  // Sync token when identity is available
  useEffect(() => {
    if (isAuthenticated && identity) {
      const principalId = identity.getPrincipal().toString();
      syncAuthToken(principalId);
      navigate({ to: "/admin/dashboard" });
    }
  }, [isAuthenticated, identity, navigate]);

  const handleLogin = async () => {
    try {
      // Clear any stale session before new login
      clearAuthToken();
      queryClient.clear();
      await clear();
      setTimeout(async () => {
        try {
          await login();
        } catch (err: any) {
          if (err?.message === "User is already authenticated") {
            await clear();
            setTimeout(() => login(), 300);
          }
        }
      }, 100);
    } catch (err) {
      console.error("[LoginPage] Login error:", err);
    }
  };

  const handleWhoAmI = async () => {
    if (!actor) {
      alert("Actor belum siap. Coba lagi sebentar.");
      return;
    }
    setWhoAmILoading(true);
    try {
      const result = await actor.whoAmI();
      console.log("[whoAmI] result:", result);
      alert(`whoAmI result:\n${result}`);
    } catch (err) {
      console.error("[whoAmI] error:", err);
      alert(`Error: ${String(err)}`);
    } finally {
      setWhoAmILoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1C1C1C" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#1C1C1C" }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#CC0000" }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute top-32 left-32 w-96 h-96 rounded-full border border-white" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-32 w-72 h-72 rounded-full border border-white" />
        </div>
        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <img
            src="/assets/logomitsubishi.png"
            alt="Mitsubishi Logo"
            className="h-20 w-auto object-contain mx-auto mb-8 brightness-0 invert"
          />
          <h2 className="text-3xl font-bold text-white mb-3">
            Mitsubishi Srikandi Subang
          </h2>
          <p className="text-white/80 text-base leading-relaxed">
            Portal manajemen konten untuk administrator
            <br />
            dealer resmi Mitsubishi Motors.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="h-1 w-16 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src="/assets/logomitsubishi.png"
              alt="Mitsubishi Logo"
              className="h-14 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-white/50 text-sm">Mitsubishi Srikandi Subang</p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <p className="text-gray-600 text-sm mb-6">
              Masuk menggunakan Internet Identity untuk mengakses panel admin.
            </p>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-3 px-6 rounded-lg font-semibold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: "#CC0000" }}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang Login...</span>
                </>
              ) : (
                <span>Login dengan Internet Identity</span>
              )}
            </button>

            {/* Temporary debug button */}
            <button
              type="button"
              onClick={handleWhoAmI}
              disabled={whoAmILoading || !actor}
              className="w-full mt-3 py-2 px-6 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg font-medium text-sm transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {whoAmILoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Memanggil whoAmI...</span>
                </>
              ) : (
                <span>🔍 Test whoAmI</span>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
              Hanya untuk administrator yang berwenang
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
