"use client";

import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function NexumHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <section className="h-screen w-full overflow-hidden relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"
      />

      <div className="relative z-10 h-full flex flex-col">

        <nav className="hidden md:flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 256 256"
              className="text-fill-[#010101] lg:text-fill-white"
            >
              <path
                d="M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z"
              />
              <text
                x="128"
                y="128"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              >
                n e x v i a
              </text>
            </svg>
            <span className="text-lg font-semibold">nexum</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg"
              >
                <a
                  href="#!"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Modules
                  <ChevronDown className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#!"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Clientele
                </a>
                <a
                  href="#!"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Solutions
                  <ChevronDown className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#!"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Billing
                </a>
              </div>

              <button
                className="rounded-full px-5 self-stretch text-sm font-medium text-white bg-gradient-to-b from-[#2B2B2B] to-[#101010] hover:opacity-90 transition-opacity"
              >
                Get started
              </button>
            </div>
          </div>
        </nav>

        <button
          className="md:hidden h-10 w-10 rounded-full bg-white/10 backdrop-blur-lg z-50"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {isMenuOpen ? (
            <X
              className="block h-5 w-5 -rotate-90 scale-0 opacity-0 transition-all duration-300 visible lg:text-white"
            />
          ) : (
            <Menu
              className="block h-5 w-5 transition-all duration-300 rotate-90 scale-0 opacity-0 lg:text-white"
            />
          )}
        </button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md opacity-100 transition-opacity duration-300"
              style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
            />

            <div
              className="fixed right-0 top-0 z-40 h-full w-72 bg-black/90 backdrop-blur-xl translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0"
            >
              <nav className="px-6 pt-24">
                <ul className="flex flex-col gap-2">
                  <li>
                    <a
                      href="#!"
                      className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Modules
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Clientele
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Solutions
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Billing
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <div
              className="mt-auto px-6 pb-10 fade-in-up"
              style={{ transition: `opacity 400ms ease, transform 400ms ease ${isMenuOpen ? "300ms" : "0ms"}` }}
            >
              <button
                className="rounded-full px-6 py-3 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-b from-[#2B2B2B] to-[#101010] hover:opacity-90 transition-opacity"
              >
                Get started
              </button>
            </div>
          </>
        )}

        <div className="flex-col h-full mt-auto px-5 pb-8 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16">
          <div className="max-w-xl mx-auto text-center mb-10 sm:mb-14">
            <h1
              className="text-3xl sm:text-4xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-[#010101] lg:text-white"
            >
              Ship AI workers that grind while you rest
            </h1>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-3 justify-center">
              <div
                className={isMenuOpen
                  ? "sm:inline-flex flex-row items-center rounded-full bg-white p-1.5"
                  : "sm:inline-flex flex-row items-center rounded-full bg-white p-1.5"}
              >
                <input
                  type="email"
                  placeholder="Type your email"
                  className={isMenuOpen
                    ? "mobile:rounded-full bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400"
                    : "sm:w-64 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-2 outline-none"}
                />
                <button
                  className="rounded-full px-6 py-3 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-b from-[#2B2B2B] to-[#101010] hover:opacity-90 transition-opacity"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5 justify-end"
          >
            <div className="sm:w-64 rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 flex flex-col justify-between">
              <div className="mb-3 sm:mb-4">
                <span
                  className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-[#010101] lg:text-white font-silkscreen"
                >
                  42,500+
                </span>
                <span className="block text-sm sm:text-base leading-relaxed text-[#010101]/70 lg:text-white/70">
                  Teams run Nexum to handle recurring ops daily.
                </span>
              </div>

              <div className="sm:w-64 rounded-2xl bg-white/10 backdrop-blur-lg p-5 sm:p-6 flex flex-col">
                <div className="h-6 w-6 rounded-full bg-black flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <span className="ml-2 text-sm font-semibold text-[#010101] lg:text-white">
                  Stratify
                </span>
              </div>

              <p
                className="text-sm leading-relaxed text-[#010101]/80 lg:text-white/80"
              >
                With Nexum we went from managing tedious operational work to having AI agents that handle everything
              </p>

              <div className="mt-4 sm:mt-5 flex items-center gap-3">
                <Image
                  src="https://i.pravatar.cc/72?img=12"
                  alt="Sara Klein"
                  className="h-9 w-9 rounded-full object-cover bg-white/20"
                  width={72}
                  height={72}
                />
                <div>
                  <span className="text-sm font-semibold text-[#010101] lg:text-white">
                    Sara Klein
                  </span>
                  <span
                    className="text-xs text-[#010101]/60 lg:text-white/60"
                  >
                    Dir of Operations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}