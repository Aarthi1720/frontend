import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-[#E5E7EB] text-[#6B7280] pb-10 md:pb-0">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="text-center md:text-left">
          <span className="text-xl font-bold tracking-tight text-[#0D9488]">CasaStay</span>
          <p className="text-sm mt-1">Find your perfect stay, anywhere.</p>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#94A3B8]">
        © {new Date().getFullYear()} CasaStay. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
