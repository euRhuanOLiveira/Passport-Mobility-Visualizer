import React from 'react';

interface InfoPanelProps {
  open: boolean;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ open, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[360px]
          bg-white z-50 shadow-xl
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              About this map
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          <section className="space-y-4 text-sm text-slate-600">
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">
                What is this map?
              </h3>
              <p>
                This interactive map shows where you can travel based on the
                passport you select. Countries are highlighted according to visa
                requirements for short-term tourist travel.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-1">
                How to read the map
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-medium text-blue-600">Blue</span>: selected passport country</li>
                <li><span className="font-medium text-emerald-600">Green</span>: visa-free or visa on arrival</li>
                <li><span className="font-medium text-rose-600">Red</span>: visa required</li>
                <li><span className="font-medium text-slate-500">Gray</span>: no data available</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-1">
                Important notes
              </h3>
              <p>
                Visa policies may change and can depend on travel purpose or
                duration. Always check official government sources before
                traveling.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-1">
                Data source
              </h3>
              <p>
                Visa information is based on publicly available data from the
                Henley Passport Index.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

export default InfoPanel;
