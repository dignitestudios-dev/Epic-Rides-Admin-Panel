import React from "react";
import { useApp } from "../../contexts/AppContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#090d16] text-gray-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-[#f8fafc] dark:bg-[#090d16] transition-colors duration-200">
          <div className="max-w-[1600px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
