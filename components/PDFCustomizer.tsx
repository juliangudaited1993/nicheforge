'use client';

import React, { useState } from 'react';
import { X, Download, Eye } from 'lucide-react';
import { NicheReport, PDFCustomizationOptions } from '@/lib/types'; // NicheReport alias = ResearchReport
import { generateProfessionalPDF } from '@/lib/generateProfessionalPDF';

interface PDFCustomizerProps {
  report: NicheReport;
  isOpen: boolean;
  onClose: () => void;
  userTier?: 'free' | 'basic' | 'pro' | 'unlimited' | 'demo';
}

const STYLE_OPTIONS = [
  { value: 'corporate' as const, label: 'Corporate', color: '#1e40af', desc: 'Professional, data-driven' },
  { value: 'legal' as const, label: 'Legal', color: '#1e3a5f', desc: 'Formal, precise, cited' },
  { value: 'medical' as const, label: 'Medical', color: '#0f766e', desc: 'Evidence-based, careful' },
  { value: 'academic' as const, label: 'Academic', color: '#4338ca', desc: 'Scholarly, thorough' },
  { value: 'personal' as const, label: 'Personal', color: '#b45309', desc: 'Practical, empathetic' },
];

const FORMAT_OPTIONS = [
  { value: 'letter' as const, label: 'US Letter' },
  { value: 'a4' as const, label: 'A4' },
];

const LENGTH_OPTIONS = [
  { value: 'short' as const, label: 'Short', pages: '8-12p' },
  { value: 'medium' as const, label: 'Medium', pages: '12-16p' },
  { value: 'long' as const, label: 'Long', pages: '16-22p' },
];

const FONT_OPTIONS = [
  { value: 'helvetica' as const, label: 'Sans' },
  { value: 'times' as const, label: 'Serif' },
  { value: 'courier' as const, label: 'Mono' },
];

export default function PDFCustomizer({ report, isOpen, onClose, userTier = 'demo' }: PDFCustomizerProps) {
  const [customization, setCustomization] = useState<PDFCustomizationOptions>({
    style: (report.researchStyle as any) || 'corporate',
    primaryColor: '#f59e0b',
    secondaryColor: '#3b82f6',
    pageFormat: 'letter',
    length: (report.reportLength as any) || 'medium',
    font: 'helvetica',
    includeAgentLog: true,
    includeSources: true,
    includeCharts: true,
    logoDataUrl: undefined,
    logoPosition: 'top-left',
    coverTitle: undefined,
    coverSubtitle: undefined,
    customFooter: undefined,
  });

  const update = (updates: Partial<PDFCustomizationOptions>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };

  const isPremium = ['pro', 'unlimited', 'demo'].includes(userTier);
  const canBrand = ['unlimited', 'demo'].includes(userTier);

  const handleDownload = () => {
    try {
      generateProfessionalPDF(report, customization);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF. Check console for details.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#0a0a0b] border border-[#27272a] rounded-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] flex-shrink-0">
          <div>
            <div className="font-semibold text-lg">Customize PDF Report</div>
            <div className="text-xs text-[#a1a1aa]">Live preview • Premium features for higher plans</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1f1f23] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-5 gap-6">
            {/* Left: Controls */}
            <div className="md:col-span-3 space-y-6">
              {/* Style */}
              <div>
                <div className="text-sm font-medium mb-2 text-[#a1a1aa]">Style</div>
                <div className="grid grid-cols-5 gap-2">
                  {STYLE_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => update({ style: s.value })}
                      className={`p-3 rounded-2xl border text-left text-xs transition ${customization.style === s.value ? 'border-[#f59e0b] bg-[#1f1f23]' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
                    >
                      <div className="w-5 h-5 rounded mb-1.5" style={{ background: s.color }} />
                      <div className="font-semibold">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <div className="text-sm font-medium mb-2 text-[#a1a1aa]">Colors</div>
                <div className="flex gap-3 items-center">
                  <input type="color" value={customization.primaryColor} onChange={e => update({ primaryColor: e.target.value })} className="w-12 h-9 p-1 bg-transparent border border-[#27272a] rounded" />
                  <input type="text" value={customization.primaryColor} onChange={e => update({ primaryColor: e.target.value })} className="input flex-1 text-sm font-mono" />
                </div>
              </div>

              {/* Format & Length */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2 text-[#a1a1aa]">Format</div>
                  <div className="flex gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button key={f.value} onClick={() => update({ pageFormat: f.value })} className={`flex-1 py-2 text-sm rounded-2xl border ${customization.pageFormat === f.value ? 'border-[#f59e0b] bg-[#1f1f23]' : 'border-[#27272a]'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-[#a1a1aa]">Length</div>
                  <div className="flex gap-1">
                    {LENGTH_OPTIONS.map(l => (
                      <button key={l.value} onClick={() => update({ length: l.value })} className={`flex-1 py-1.5 text-xs rounded-2xl border ${customization.length === l.value ? 'border-[#f59e0b] bg-[#1f1f23]' : 'border-[#27272a]'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced - Premium */}
              {isPremium && (
                <>
                  <div>
                    <div className="text-sm font-medium mb-2 text-[#a1a1aa]">Font</div>
                    <div className="flex gap-2">
                      {FONT_OPTIONS.map(f => (
                        <button key={f.value} onClick={() => update({ font: f.value })} className={`flex-1 py-1.5 text-sm rounded-2xl border ${customization.font === f.value ? 'border-[#f59e0b] bg-[#1f1f23]' : 'border-[#27272a]'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2 text-[#a1a1aa]">Include in PDF</div>
                    <div className="space-y-1 text-sm">
                      {(['includeAgentLog', 'includeSources', 'includeCharts'] as const).map(key => (
                        <label key={key} className="flex items-center gap-2">
                          <input type="checkbox" checked={customization[key]} onChange={e => update({ [key]: e.target.checked })} />
                          {key.replace('include', '').replace(/([A-Z])/g, ' $1')}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Premium Branding */}
              {canBrand && (
                <div className="pt-4 border-t border-[#27272a] space-y-3">
                  <div className="text-sm font-medium text-[#a1a1aa]">Premium Cover & Branding</div>
                  
                  <input
                    type="text"
                    placeholder="Cover Title (e.g. Your Company Name)"
                    value={customization.coverTitle || ''}
                    onChange={e => update({ coverTitle: e.target.value || undefined })}
                    className="input w-full text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Cover Subtitle (optional)"
                    value={customization.coverSubtitle || ''}
                    onChange={e => update({ coverSubtitle: e.target.value || undefined })}
                    className="input w-full text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Custom Footer Text"
                    value={customization.customFooter || ''}
                    onChange={e => update({ customFooter: e.target.value || undefined })}
                    className="input w-full text-sm"
                  />

                  <div>
                    <div className="text-xs mb-1 text-[#a1a1aa]">Logo (PNG/JPG)</div>
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onload = ev => update({ logoDataUrl: ev.target?.result as string });
                        r.readAsDataURL(f);
                      }
                    }} />
                    {customization.logoDataUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={customization.logoDataUrl} className="h-8 border border-[#27272a]" alt="logo" />
                        <button onClick={() => update({ logoDataUrl: undefined })} className="text-xs text-red-400">Remove</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="md:col-span-2">
              <div className="text-sm font-medium mb-2 text-[#a1a1aa] flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Preview
              </div>
              <div className="border border-[#27272a] rounded-xl overflow-hidden bg-white shadow-inner" style={{ aspectRatio: '8.5/11' }}>
                <div className="h-full w-full p-3 text-black flex flex-col text-center" style={{ background: '#111113', color: '#ededed' }}>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-[9px] tracking-widest opacity-70 mb-1">RESEARCHFORGE</div>
                    <div className="text-sm font-semibold mb-1">
                      {customization.coverTitle || "Professional Research Report"}
                    </div>
                    {customization.coverSubtitle && (
                      <div className="text-[10px] opacity-70 mb-2">{customization.coverSubtitle}</div>
                    )}
                    <div className="text-xs opacity-80">{report.topic || 'Research Topic'}</div>
                    <div className="text-4xl font-bold mt-3" style={{ color: customization.primaryColor }}>{report.score}</div>
                  </div>
                  {customization.logoDataUrl && (
                    <img src={customization.logoDataUrl} className="h-6 mx-auto mb-1" alt="logo" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Download Footer */}
        <div className="px-6 py-4 border-t border-[#27272a] flex justify-end gap-3 bg-[#111113] flex-shrink-0">
          <button onClick={onClose} className="btn-secondary px-6 py-2 rounded-2xl">Cancel</button>
          <button onClick={handleDownload} className="btn-primary inline-flex items-center gap-2 px-6 py-2 rounded-2xl font-semibold">
            <Download className="w-4 h-4" /> Download Customized PDF
          </button>
        </div>
      </div>
    </div>
  );
}
