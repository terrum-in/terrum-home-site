"use client";

import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f0f4f0]">
      <p className="text-2xl font-light text-[#3C5A3A] mb-8">
        Your patience is as valuable as clean air!
      </p>

      <div className="flex space-x-2">
        <div
          className="w-4 h-4 bg-[#2E8B57] rounded-full wave-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-4 h-4 bg-[#2E8B57] rounded-full wave-bounce"
          style={{ animationDelay: "100ms" }}
        ></div>
        <div
          className="w-4 h-4 bg-[#2E8B57] rounded-full wave-bounce"
          style={{ animationDelay: "200ms" }}
        ></div>
        <div
          className="w-4 h-4 bg-[#2E8B57] rounded-full wave-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>

      <p className="text-sm text-[#607D6A] opacity-70 mt-8">
        Hang on! We're almost there.
      </p>
    </div>
  );
};

export default LoadingScreen;
