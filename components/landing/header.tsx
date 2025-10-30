"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Function to format section names
  const formatSectionName = (section: string): string => {
    return section
      .replace("#", "") // Remove #
      .replace(/-/g, " ") // Replace hyphens with spaces
      .replace(/\bsection\b/i, "") // Remove the word "section" (case-insensitive)
      .trim() // Remove any extra spaces
      .replace(/\b\w/g, (char: string) => char.toUpperCase()); // Capitalize first letter of each word
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/terrum_circle.svg"
          alt="Terrum Logo"
          width={48}
          height={48}
          className="h-12 w-12"
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {["Resources", "Events"].map((item) =>
          item === "Resources" ? (
            <a
              data-umami-event="Open Resources Dashboard"
              data-umami-event-device="Desktop"
              key={item}
              href="https://resources.terrum.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 font-medium"
            >
              {item}
            </a>
          ) : (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-white hover:text-white/80 font-medium"
            >
              {item}
            </Link>
          )
        )}
      </div>

      {/* Hamburger Icon */}
      <button
        className="md:hidden text-white focus:outline-none"
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Mobile Navigation Sheet */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black text-white transform ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Close Button */}
        <button
          className="absolute top-8 right-8 text-white focus:outline-none"
          onClick={closeMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Menu Items */}
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {[
            "Resources",
            "Events",
            "#events-and-experiences-section",
            "#employee-engagement-section",
            "#support-a-social-organisation-section",
            "#open-source-database-section",
          ].map((item) => {

            if (item === "Resources") {
              return (
                <a
                  key={item}
                  href="https://resources.terrum.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 font-medium"
                  onClick={closeMenu}
                >
                  {formatSectionName(item)}
                </a>
              );
            }

            if (item === "Events") {
              return (
                <Link
                  key={item}
                  href="/events"
                  className="text-white hover:text-white/80 font-medium"
                  onClick={closeMenu}
                >
                  {item}
                </Link>
              );
            }

            // Anchor links for on-page sections
            return (
              <a
                key={item}
                href={item}
                className="text-white hover:text-white/80 font-medium"
                onClick={closeMenu}
              >
                {formatSectionName(item)}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
