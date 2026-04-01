"use client";

import React, { useState, useRef, useEffect, useCallback, useActionState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginUser, registerUser } from "../actions/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  // ─── Mode Toggle ──────────────────────────────────────────────
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const recoverRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const isLogin = mode === "login";
  const isRecover = mode === "recover";

  // ─── Login State ──────────────────────────────────────────────
  const [loginState, loginAction, isLoginPending] = useActionState(loginUser, { success: false, message: "" } as any);

  // ─── Register State ───────────────────────────────────────────
  const [profileType, setProfileType] = useState<"participante" | "organizador">("participante");
  const [registerState, registerAction, isRegisterPending] = useActionState(registerUser, { success: false, message: "" } as any);

  // ─── Recover State ────────────────────────────────────────────
  const [recoverEmail, setRecoverEmail] = useState("");

  // ─── Dynamic Height ───────────────────────────────────────────
  const measureHeight = useCallback(() => {
    const ref = isLogin
      ? loginRef.current
      : isRecover
        ? recoverRef.current
        : registerRef.current;
    if (ref) {
      setContainerHeight(ref.scrollHeight);
    }
  }, [isLogin, isRecover]);

  useEffect(() => {
    measureHeight();
    window.addEventListener("resize", measureHeight);
    return () => window.removeEventListener("resize", measureHeight);
  }, [measureHeight]);

  // Redireciona ao ter sucesso
  useEffect(() => {
    if (loginState?.success || registerState?.success) {
      // Redireciona de volta para a Home (ou dashboard)
      router.push("/");
    }
  }, [loginState, registerState, router]);

  const handleRecoverSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Recover submitted", { recoverEmail });
  };


  return (
    <div className="bg-[#f5f7f8] text-[#0f172a] min-h-screen flex items-center justify-center p-0 md:p-4 font-sans">
      {/* ── Auth Container ────────────────────────────────────── */}
      <main className="w-full max-w-6xl md:min-h-[921px] bg-white flex flex-col md:flex-row shadow-2xl overflow-hidden md:rounded-xl">
        {/* ── Left Column: Branding & Image ───────────────────── */}
        <section className="relative w-full md:w-1/2 min-h-[200px] sm:min-h-[260px] md:min-h-full overflow-hidden">
          {/* Emerald overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,104,55,0.75)] to-[rgba(0,104,55,0.9)]" />

          {/* Campus background image */}
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6TIAT5k7o5tmYhVEWBKDTex9ceIMXWfjIXK5eLv3ux-vPirgSuI_AUe970YntPn_vVKVVG2INVv4f83fZ0aw68qNpuWQBjTvHLgb7UeTyqCNUqo7egXzS2gZO_NY0G8SDhyKJ8WA5pleL7pBiuyARmBn1TAEYcaJ-CVlpfjr8AIaIWfODGUmAUsTizh3bpS8FqFevegCcBdYb3hNJEY8mFx8x6gfkHdrw-uNAaedyqZ4uqe95OAv-IN9hODfWNlzzZFhGlxLcuqs"
            alt="UTAD Campus"
            fill
            className="object-cover"
            priority
          />

          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center p-5 sm:p-8 text-white">
            <div className="mb-3 sm:mb-6">
              <span className="material-symbols-outlined text-4xl sm:text-6xl opacity-90">
                confirmation_number
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 sm:mb-4">
              UTAD FastTicket
            </h1>

            <p className="text-emerald-50 text-sm sm:text-lg font-medium max-w-xs opacity-90">
              Acesso rápido aos eventos e serviços da academia.
            </p>

            <div className="mt-12 hidden md:block">
              <div className="w-16 h-1 bg-white/30 mx-auto rounded-full" />
            </div>
          </div>
        </section>

        {/* ── Right Column: Forms ────────────────────────────────── */}
        <section className="w-full md:w-1/2 p-4 sm:p-6 md:p-12 flex flex-col justify-center bg-white overflow-hidden">
          {/* Tabs / Back button */}
          <div className="mb-5 sm:mb-8">
            {/* Recover mode: show back button */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isRecover ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={() => setMode("login")}
                className="group flex items-center gap-2 text-[#006837] font-bold hover:text-[#004d29] transition-colors py-3"
              >
                <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1">
                  keyboard_backspace
                </span>
                Voltar ao Login
              </button>
            </div>

            {/* Login/Register tabs */}
            <nav
              className={`flex bg-[#f1f5f9] rounded-lg p-1.5 w-full relative transition-all duration-300 ease-in-out ${
                isRecover ? "max-h-0 opacity-0 overflow-hidden" : "max-h-20 opacity-100"
              }`}
            >
              {/* Sliding pill background */}
              <div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white shadow-sm rounded-md ring-1 ring-black/5 transition-all duration-300 ease-in-out"
                style={{ left: isLogin ? "6px" : "calc(50% + 0px)" }}
              />
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative z-10 flex-1 py-3 text-center text-sm font-bold transition-colors duration-300 ${
                  isLogin ? "text-[#006837]" : "text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`relative z-10 flex-1 py-3 text-center text-sm font-bold transition-colors duration-300 ${
                  mode === "register" ? "text-[#006837]" : "text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                Registar
              </button>
            </nav>
          </div>

          {/* ── Forms Container with slide animation ────────────── */}
          <div
            className="relative w-full overflow-hidden transition-[height] duration-400 ease-in-out"
            style={{ height: containerHeight > 0 ? containerHeight : "auto" }}
          >
            {/* ─── Login Form ───────────────────────────────────── */}
            <div
              ref={loginRef}
              className={`absolute inset-x-0 top-0 transition-all duration-400 ease-in-out ${
                isLogin
                  ? "opacity-100 translate-x-0 visible"
                  : "opacity-0 -translate-x-8 invisible pointer-events-none"
              }`}
            >
              <div className="mb-5 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]">
                  Iniciar Sessão
                </h2>
                <p className="text-[#475569] mt-1 sm:mt-2 text-sm sm:text-base">
                  Introduza os seus dados para aceder à sua conta académica.
                </p>
              </div>

              <form className="space-y-4 sm:space-y-5" action={loginAction}>
                {/* Academic Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                  >
                    E-mail Académico
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                      alternate_email
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="exemplo@utad.pt"
                      name="login-email"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                    >
                      Palavra-passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("recover")}
                      className="text-xs font-bold text-[#006837] hover:underline"
                    >
                      Esqueci-me da palavra-passe
                    </button>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                      lock
                    </span>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      name="login-password"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center ml-1">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#006837] border-[#e2e8f0] rounded focus:ring-[#006837]/20"
                    />
                    <span className="ml-3 text-sm font-medium text-[#475569]">
                      Lembrar-me
                    </span>
                  </label>
                </div>

                {/* Error Message */}
                {loginState?.message && !loginState.success && (
                  <p className="text-red-600 text-sm">{loginState.message}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoginPending}
                  className="w-full bg-[#006837] text-white font-bold py-4 rounded-lg shadow-lg shadow-[#006837]/20 hover:bg-[#004d29] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isLoginPending ? "A entrar..." : "Entrar"}
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-10">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e2e8f0]" />
                  </div>
                  <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-widest text-[#475569]">
                    Ou entrar com
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors text-xs font-semibold text-[#1e293b]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>

                  <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors text-xs font-semibold text-[#1e293b]">
                    <span className="material-symbols-outlined text-lg text-emerald-600">
                      cloud
                    </span>
                    EduCloud
                  </button>
                </div>
              </div>

              <footer className="mt-10 text-center">
                <p className="text-[10px] text-[#475569] leading-relaxed">
                  Não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-[#006837] font-bold hover:underline"
                  >
                    Registe-se
                  </button>
                  .
                </p>
              </footer>
            </div>

            {/* ─── Register Form ────────────────────────────────── */}
            <div
              ref={registerRef}
              className={`absolute inset-x-0 top-0 transition-all duration-400 ease-in-out ${
                mode === "register"
                  ? "opacity-100 translate-x-0 visible"
                  : "opacity-0 translate-x-8 invisible pointer-events-none"
              }`}
            >
              <div className="mb-5 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]">
                  Criar a sua conta UTAD FastTicket
                </h2>
                <p className="text-[#475569] mt-1 sm:mt-2 text-sm sm:text-base">
                  Escolha o seu perfil e junte-se à nossa comunidade.
                </p>
              </div>

              <form className="space-y-4 sm:space-y-5" action={registerAction}>
                {/* Profile Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1">
                    Tipo de Conta
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="profile_type"
                        value="participante"
                        className="hidden peer"
                        checked={profileType === "participante"}
                        onChange={() => setProfileType("participante")}
                      />
                      <div className="p-4 border-2 border-[#e2e8f0] rounded-xl transition-all duration-200 group-hover:border-[#006837]/50 text-center peer-checked:border-[#006837] peer-checked:bg-[#f0fdf4] peer-checked:ring-2 peer-checked:ring-[#006837]">
                        <span className="material-symbols-outlined text-3xl mb-2 text-[#006837]">
                          person
                        </span>
                        <h3 className="font-bold text-sm block">Participante</h3>
                        <p className="text-[10px] text-[#475569] leading-tight mt-1">
                          Comprar bilhetes e ir a eventos
                        </p>
                      </div>
                    </label>
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="profile_type"
                        value="organizador"
                        className="hidden peer"
                        checked={profileType === "organizador"}
                        onChange={() => setProfileType("organizador")}
                      />
                      <div className="p-4 border-2 border-[#e2e8f0] rounded-xl transition-all duration-200 group-hover:border-[#006837]/50 text-center peer-checked:border-[#006837] peer-checked:bg-[#f0fdf4] peer-checked:ring-2 peer-checked:ring-[#006837]">
                        <span className="material-symbols-outlined text-3xl mb-2 text-[#006837]">
                          campaign
                        </span>
                        <h3 className="font-bold text-sm block">Organizador</h3>
                        <p className="text-[10px] text-[#475569] leading-tight mt-1">
                          Criar e gerir os seus próprios eventos
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-name"
                    className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                  >
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                      person
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Inserir o seu nome completo"
                      name="reg-name"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Academic Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-email"
                    className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                  >
                    E-mail Académico
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                      alternate_email
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="exemplo@utad.pt"
                      name="reg-email"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-password"
                      className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                    >
                      Palavra-passe
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                        lock
                      </span>
                      <input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        name="reg-password"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-confirm-password"
                      className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                    >
                      Confirmar
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                        verified_user
                      </span>
                      <input
                        id="reg-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        name="reg-confirm-password"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {registerState?.message && !registerState.success && (
                  <p className="text-red-600 text-sm">{registerState.message}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isRegisterPending}
                  className="w-full bg-[#006837] text-white font-bold py-4 rounded-lg shadow-lg shadow-[#006837]/20 hover:bg-[#004d29] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isRegisterPending ? "A criar conta..." : "Criar Conta"}
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e2e8f0]" />
                  </div>
                  <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-widest text-[#475569]">
                    Ou registar com
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors text-xs font-semibold text-[#1e293b]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>

                  <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors text-xs font-semibold text-[#1e293b]">
                    <span className="material-symbols-outlined text-lg text-emerald-600">
                      cloud
                    </span>
                    EduCloud
                  </button>
                </div>
              </div>

              <footer className="mt-8 text-center">
                <p className="text-[10px] text-[#475569] leading-relaxed">
                  Ao registar-se, concorda com os nossos{" "}
                  <Link href="#" className="text-[#006837] font-bold hover:underline">
                    Termos de Serviço
                  </Link>{" "}
                  e{" "}
                  <Link href="#" className="text-[#006837] font-bold hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </footer>
            </div>

            {/* ─── Recover Password Form ────────────────────────── */}
            <div
              ref={recoverRef}
              className={`absolute inset-x-0 top-0 transition-all duration-400 ease-in-out ${
                isRecover
                  ? "opacity-100 translate-x-0 visible"
                  : "opacity-0 translate-x-8 invisible pointer-events-none"
              }`}
            >
              <div className="mb-5 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#f0fdf4] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#006837] text-2xl">
                      lock_reset
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]">
                  Recuperar Palavra-passe
                </h2>
                <p className="text-[#475569] mt-1 sm:mt-2 text-sm sm:text-base">
                  Introduza o seu e-mail para receber instruções de recuperação.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleRecoverSubmit}>
                {/* Academic Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="recover-email"
                    className="text-xs font-bold uppercase tracking-widest text-[#475569] ml-1"
                  >
                    E-mail Académico
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#006837] transition-colors">
                      mail
                    </span>
                    <input
                      id="recover-email"
                      type="email"
                      placeholder="exemplo@utad.pt"
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#f8fafb] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all outline-none text-[#0f172a]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#006837] text-white font-bold py-4 rounded-lg shadow-lg shadow-[#006837]/20 hover:bg-[#004d29] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Enviar Instruções
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Support Section */}
              <div className="mt-10 pt-6 border-t border-[#e2e8f0] flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-px w-8 bg-[#e2e8f0]" />
                  <span className="text-[#94a3b8] text-xs uppercase tracking-[0.2em] font-bold">
                    Suporte
                  </span>
                  <div className="h-px w-8 bg-[#e2e8f0]" />
                </div>
                <p className="text-[#475569] text-sm text-center">
                  Problemas no acesso? Contacte os{" "}
                  <Link href="#" className="text-[#006837] hover:underline font-medium">
                    Serviços de Informática da UTAD
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Support Access ────────────────────────────────────── */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex items-center gap-4">
        <button className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
          <span className="material-symbols-outlined text-[20px] sm:text-[24px]">help_outline</span>
        </button>
      </div>
    </div>
  );
}
