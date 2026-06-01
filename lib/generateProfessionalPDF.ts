import jsPDF from 'jspdf';
import { NicheReport } from './types';

export function generateProfessionalPDF(report: NicheReport) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const amber = '#f59e0b';
  const darkBg = '#111113';
  const textDark = '#171717';

  // Helper to draw a rounded rect
  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) => {
    if (fill) doc.setFillColor(fill);
    if (stroke) doc.setDrawColor(stroke);
    doc.roundedRect(x, y, w, h, r, r, fill ? 'F' : 'S');
  };

  // ==================== COVER PAGE ====================
  doc.setFillColor(17, 17, 19); // #111113
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Accent bar at top
  doc.setFillColor(245, 158, 11); // amber
  doc.rect(0, 0, pageWidth, 8, 'F');

  const styleLabel = report.researchStyle ? report.researchStyle.toUpperCase() : 'RESEARCH';
  const lengthLabel = report.reportLength ? report.reportLength.toUpperCase() : 'STANDARD';

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("RESEARCHFORGE", margin, 28);
  doc.setFontSize(9);
  doc.text(`CONFIDENTIAL ${styleLabel} INTELLIGENCE`, margin, 35);

  doc.setFontSize(28);
  doc.text("Professional Research Report", margin, 75);

  doc.setFontSize(18);
  doc.text(report.topic || report.niche || 'Research Topic', margin, 90);

  // Big score
  doc.setFontSize(72);
  doc.setTextColor(245, 158, 11);
  doc.text(String(report.score), margin, 140);

  doc.setFontSize(14);
  doc.setTextColor(180, 180, 180);
  doc.text(`${lengthLabel} • ${styleLabel} • ${report.depth.toUpperCase()}`, margin, 152);

  doc.setFontSize(10);
  doc.text(`Generated ${new Date(report.created_at || Date.now()).toLocaleDateString()}`, margin, 165);

  // Footer
  doc.setFontSize(8);
  doc.text(`Prepared by ResearchForge • ${styleLabel} Style • Powered by Grok`, margin, pageHeight - 18);

  doc.addPage();

  // ==================== EXECUTIVE SUMMARY ====================
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(17, 17, 19);
  doc.setFontSize(11);
  doc.text("NICHEFORGE AI", margin, 18);
  doc.setFontSize(8);
  doc.text("EXECUTIVE SUMMARY", margin, 25);

  // Title
  doc.setFontSize(20);
  doc.text(report.niche, margin, 42);

  // Score badge
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(pageWidth - margin - 55, 32, 55, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${report.score}/100`, pageWidth - margin - 48, 44);

  // Summary box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, 55, contentWidth, 55, 4, 4, 'FD');

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(report.summary, contentWidth - 16);
  doc.text(summaryLines, margin + 8, 65);

  // ==================== KEY METRICS WITH CHARTS ====================
  let y = 125;

  doc.setTextColor(17, 17, 19);
  doc.setFontSize(13);
  doc.text("KEY VALIDATION METRICS", margin, y);
  y += 12;

  const barHeight = 14;
  const barMaxWidth = contentWidth - 90;

  report.metrics.forEach((metric, index) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 25;
    }

    // Label
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(metric.label, margin, y + 9);

    // Background bar
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + 85, y, barMaxWidth, barHeight, 'F');

    // Value bar
    const barWidth = (metric.value / 100) * barMaxWidth;
    doc.setFillColor(245, 158, 11);
    doc.rect(margin + 85, y, barWidth, barHeight, 'F');

    // Value text
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(9);
    doc.text(`${metric.value}`, margin + 88 + barWidth, y + 9);

    // Note
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(metric.note, margin + 85, y + 20);

    y += 28;
  });

  // ==================== INSIGHTS ====================
  y += 10;
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 25;
  }

  doc.setTextColor(17, 17, 19);
  doc.setFontSize(13);
  doc.text("STRATEGIC INSIGHTS", margin, y);
  y += 10;

  report.insights.forEach((insight, i) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 25;
    }
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(`• ${insight}`, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  });

  // ==================== COMPETITORS ====================
  y += 8;
  if (y > pageHeight - 100) {
    doc.addPage();
    y = 25;
  }

  doc.setTextColor(17, 17, 19);
  doc.setFontSize(13);
  doc.text("COMPETITIVE LANDSCAPE", margin, y);
  y += 10;

  report.competitors.forEach((comp, i) => {
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 25;
    }

    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(comp.name, margin + 6, y + 10);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Strength: ${comp.strength}`, margin + 6, y + 17);
    doc.text(`Gap: ${comp.gap}`, margin + 6, y + 24);

    y += 38;
  });

  // ==================== ACTION PLAYBOOK ====================
  y += 5;
  if (y > pageHeight - 100) {
    doc.addPage();
    y = 25;
  }

  doc.setTextColor(17, 17, 19);
  doc.setFontSize(13);
  doc.text("90-DAY ACTION PLAN", margin, y);
  y += 10;

  report.playbook.forEach((step, i) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 25;
    }

    // Number circle
    doc.setFillColor(245, 158, 11);
    doc.circle(margin + 6, y + 4, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(String(i + 1), margin + 3.5, y + 6.5);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(step, contentWidth - 22);
    doc.text(lines, margin + 16, y + 2);
    y += Math.max(14, lines.length * 5 + 6);
  });

  // ==================== MARKET ANALYSIS (Deep) ====================
  if (report.market_analysis) {
    y += 15;
    if (y > pageHeight - 80) { doc.addPage(); y = 25; }

    doc.setTextColor(17, 17, 19);
    doc.setFontSize(14);
    doc.text("MARKET ANALYSIS", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const analysisLines = doc.splitTextToSize(report.market_analysis, contentWidth);
    doc.text(analysisLines, margin, y);
    y += analysisLines.length * 5 + 15;
  }

  // ==================== COMPETITOR MATRIX (Deep) ====================
  if (report.competitor_matrix && report.competitor_matrix.length > 0) {
    y += 10;
    if (y > pageHeight - 120) { doc.addPage(); y = 25; }

    doc.setTextColor(17, 17, 19);
    doc.setFontSize(14);
    doc.text("COMPETITOR MATRIX & ANALYSIS", margin, y);
    y += 12;

    report.competitor_matrix.forEach((comp, i) => {
      if (y > pageHeight - 50) { doc.addPage(); y = 25; }

      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text(`${i + 1}. ${comp.name} — Opportunity: ${comp.opportunity_score}/100`, margin, y);
      y += 7;

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Pricing: ${comp.pricing}`, margin + 5, y);
      y += 5;
      doc.text(`Strengths: ${comp.strengths.join(', ')}`, margin + 5, y);
      y += 5;
      doc.text(`Weaknesses: ${comp.weaknesses.join(', ')}`, margin + 5, y);
      y += 10;
    });
  }

  // ==================== FINANCIAL PROJECTIONS ====================
  if (report.financial_projections) {
    y += 10;
    if (y > pageHeight - 80) { doc.addPage(); y = 25; }

    doc.setTextColor(17, 17, 19);
    doc.setFontSize(14);
    doc.text("FINANCIAL PROJECTIONS & PROFITABILITY", margin, y);
    y += 10;

    const fp = report.financial_projections;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`TAM: ${fp.estimated_tam}   |   SAM: ${fp.sam}   |   SOM: ${fp.som}`, margin, y);
    y += 7;
    doc.text(`Year 1 Revenue Potential: ${fp.revenue_potential_year1}`, margin, y);
    y += 5;
    doc.text(`Year 3 Revenue Potential: ${fp.revenue_potential_year3}`, margin, y);
    y += 8;

    doc.text("Key Assumptions:", margin, y);
    y += 6;
    fp.key_assumptions.forEach(assumption => {
      doc.text(`• ${assumption}`, margin + 5, y);
      y += 5;
    });
  }

  // ==================== RISK ASSESSMENT ====================
  if (report.risk_assessment && report.risk_assessment.length > 0) {
    y += 12;
    if (y > pageHeight - 60) { doc.addPage(); y = 25; }

    doc.setTextColor(17, 17, 19);
    doc.setFontSize(14);
    doc.text("RISK ASSESSMENT & MITIGATION", margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    report.risk_assessment.forEach(risk => {
      if (y > pageHeight - 25) { doc.addPage(); y = 25; }
      doc.text(`• ${risk}`, margin, y);
      y += 6;
    });
  }

  // ==================== DETAILED SOURCES ====================
  if (report.detailed_sources && report.detailed_sources.length > 0) {
    y += 15;
    if (y > pageHeight - 60) { doc.addPage(); y = 25; }

    doc.setTextColor(17, 17, 19);
    doc.setFontSize(14);
    doc.text("DETAILED SOURCES & CREDIBILITY", margin, y);
    y += 10;

    report.detailed_sources.forEach((source, i) => {
      if (y > pageHeight - 35) { doc.addPage(); y = 25; }

      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(`${i + 1}. ${source.title}`, margin, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`URL: ${source.url}`, margin + 5, y);
      y += 5;
      doc.text(`Summary: ${source.summary.substring(0, 180)}${source.summary.length > 180 ? '...' : ''}`, margin + 5, y);
      y += 5;
      doc.text(`Credibility: ${source.credibility}`, margin + 5, y);
      y += 8;
    });
  }

  // ==================== AGENT COLLABORATION SUMMARY ====================
  if (report.agent_collaboration_log && report.agent_collaboration_log.length > 0) {
    y += 10;
    if (y > pageHeight - 60) { doc.addPage(); y = 25; }

    doc.setTextColor(17, 17, 19);
    doc.setFontSize(14);
    doc.text("AGENT COLLABORATION & RESEARCH PROCESS", margin, y);
    y += 10;

    report.agent_collaboration_log.forEach((log, i) => {
      if (y > pageHeight - 30) { doc.addPage(); y = 25; }

      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(`${i + 1}. ${log.agent} — ${log.step}`, margin, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const reasoningLines = doc.splitTextToSize(log.reasoning, contentWidth - 10);
      doc.text(reasoningLines, margin + 5, y);
      y += reasoningLines.length * 5 + 3;

      if (log.sources_used.length > 0) {
        doc.text(`Sources: ${log.sources_used.join(', ')}`, margin + 5, y);
        y += 6;
      }
    });
  }

  // Final footer
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("NicheForge AI • Generated with Grok Heavy (Multi-Agent) • Confidential", margin, pageHeight - 12);

  doc.save(`${report.niche.toLowerCase().replace(/\s+/g, '-')}-nicheforge-report.pdf`);
}
