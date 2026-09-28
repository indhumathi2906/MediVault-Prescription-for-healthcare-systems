import React, { useState, useRef, useEffect } from 'react';
import { useTheme, TemplateId, FontPairingId } from '../../context/ThemeContext.js';
import { Palette, Check, Type, Sparkles } from 'lucide-react';

export const TemplateSelector: React.FC = () => {
  const { template, setTemplate, fontPairing, setFontPairing, availableTemplates } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTemplateInfo = availableTemplates.find((t) => t.id === template) || availableTemplates[0];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
        title="Change Visual Template & Typography"
      >
        <Palette className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline-block max-w-[120px] truncate">{activeTemplateInfo.name}</span>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white"
          style={{ backgroundColor: activeTemplateInfo.dotColor }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Professional Templates
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Instant clinical colorway & typographic styling
              </p>
            </div>
          </div>

          {/* Color Templates */}
          <div className="space-y-1.5 mb-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Color Palette
            </span>
            {availableTemplates.map((t) => {
              const isSelected = t.id === template;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: t.accentColor }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{t.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accentColor }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Typography Selector */}
          <div className="pt-2.5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Type className="w-3 h-3 text-slate-400" /> Font Typography
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'corporate', label: 'Executive', sub: 'Outfit + Jakarta' },
                { id: 'modern', label: 'Geometric', sub: 'Jakarta Sans' },
                { id: 'clinical', label: 'Clinical', sub: 'High Legibility' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontPairing(f.id as FontPairingId)}
                  className={`p-1.5 text-center rounded-md border transition-all ${
                    fontPairing === f.id
                      ? 'border-slate-800 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-[11px] font-semibold">{f.label}</p>
                  <p className={`text-[9px] truncate ${fontPairing === f.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {f.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
