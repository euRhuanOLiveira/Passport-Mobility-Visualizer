import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      className="
        bg-white/80 backdrop-blur-sm
        border-t border-slate-200
        text-[11px] text-slate-500
        px-4 py-2
        flex items-center justify-center
        text-center
      "
    >
      <span>
        Built by <span className="font-medium text-slate-700">
          Rhuan de Oliveira Costa
        </span>{' '}
        · Data based on the Henley Passport Index · Educational &amp; visualization project
      </span>
    </footer>
  );
};

export default Footer;
