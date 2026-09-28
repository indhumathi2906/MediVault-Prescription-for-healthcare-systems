import React, { createContext, useContext, useState, useEffect } from 'react';

export type TemplateId = 'executive' | 'digital-health' | 'institutional' | 'minimalist';
export type FontPairingId = 'corporate' | 'modern' | 'clinical';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  bgLight: string;
  previewClass: string;
  dotColor: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'executive',
    name: 'Executive Clinical',
    tagline: 'Deep Navy & Cobalt — EHR / Hospital Standard',
    primaryColor: '#0f172a',
    accentColor: '#2563eb',
    bgLight: '#eff6ff',
    previewClass: 'from-slate-900 to-blue-700',
    dotColor: '#2563eb',
  },
  {
    id: 'digital-health',
    name: 'Modern HealthTech',
    tagline: 'Deep Cyan-Slate & Precision Medical Emerald',
    primaryColor: '#0f766e',
    accentColor: '#0d9488',
    bgLight: '#f0fdfa',
    previewClass: 'from-slate-900 to-teal-700',
    dotColor: '#0d9488',
  },
  {
    id: 'institutional',
    name: 'Institutional Steel',
    tagline: 'High-Density Slate & Royal Sapphire Blue',
    primaryColor: '#1e293b',
    accentColor: '#0284c7',
    bgLight: '#f0f9ff',
    previewClass: 'from-slate-800 to-sky-700',
    dotColor: '#0284c7',
  },
  {
    id: 'minimalist',
    name: 'Minimalist Monochrome',
    tagline: 'Refined Charcoal, Crisp Contrast & Subtle Blue',
    primaryColor: '#18181b',
    accentColor: '#4f46e5',
    bgLight: '#f8fafc',
    previewClass: 'from-zinc-900 to-indigo-800',
    dotColor: '#4f46e5',
  },
];

interface ThemeContextType {
  template: TemplateId;
  fontPairing: FontPairingId;
  setTemplate: (template: TemplateId) => void;
  setFontPairing: (font: FontPairingId) => void;
  availableTemplates: TemplateInfo[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [template, setTemplateState] = useState<TemplateId>(() => {
    const saved = localStorage.getItem('medivault_template') as TemplateId;
    return saved && ['executive', 'digital-health', 'institutional', 'minimalist'].includes(saved)
      ? saved
      : 'executive';
  });

  const [fontPairing, setFontPairingState] = useState<FontPairingId>(() => {
    const saved = localStorage.getItem('medivault_font') as FontPairingId;
    return saved && ['corporate', 'modern', 'clinical'].includes(saved) ? saved : 'corporate';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-template', template);
    localStorage.setItem('medivault_template', template);
  }, [template]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontPairing);
    localStorage.setItem('medivault_font', fontPairing);
  }, [fontPairing]);

  const setTemplate = (t: TemplateId) => {
    setTemplateState(t);
  };

  const setFontPairing = (f: FontPairingId) => {
    setFontPairingState(f);
  };

  return (
    <ThemeContext.Provider
      value={{
        template,
        fontPairing,
        setTemplate,
        setFontPairing,
        availableTemplates: TEMPLATES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
