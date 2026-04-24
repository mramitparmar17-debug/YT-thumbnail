import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import Sidebar from './components/Sidebar';
import FileDropzone from './components/FileDropzone';
import ChartsPanel from './components/ChartsPanel';

const api = axios.create({ baseURL: 'http://localhost:3030' });

export default function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [crmFile, setCrmFile] = useState(null);
  const [adsFile, setAdsFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const kpis = useMemo(() => analysis?.kpis || {}, [analysis]);

  const runAnalysis = async () => {
    if (!crmFile || !adsFile) {
      setError('Please upload both CRM and Facebook Ads files.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const formData = new FormData();
      formData.append('crmFile', crmFile);
      formData.append('adsFile', adsFile);

      const response = await api.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAnalysis(response.data.analysis);
      setInsights(response.data.insights || []);
      setRecommendations(response.data.recommendations || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Analysis failed. Ensure backend is running on port 3030.');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('CRM Analyzer Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Revenue: ${kpis.totalRevenue?.toFixed(2) || 0}`, 14, 35);
    doc.text(`Total Spend: ${kpis.totalSpend?.toFixed(2) || 0}`, 14, 43);
    doc.text(`Overall ROAS: ${kpis.overallROAS?.toFixed(2) || 0}`, 14, 51);

    let cursor = 65;
    doc.text('AI Insights:', 14, cursor);
    insights.forEach((line) => {
      cursor += 8;
      doc.text(`- ${line}`, 14, cursor, { maxWidth: 180 });
    });

    cursor += 12;
    doc.text('Campaign Recommendations:', 14, cursor);
    recommendations.forEach((rec) => {
      cursor += 8;
      doc.text(`- ${rec.campaign}: ${rec.recommendation}`, 14, cursor, { maxWidth: 180 });
    });

    doc.save('crm-analyzer-report.pdf');
  };

  const exportExcel = () => {
    if (!analysis) return;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analysis.channelRevenue), 'Channel Revenue');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analysis.monthlyRevenue), 'Monthly Revenue');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analysis.campaignPerformance), 'Campaigns');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recommendations), 'Recommendations');
    XLSX.writeFile(workbook, 'crm-analyzer-summary.xlsx');
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content">
        <header className="topbar">
          <div>
            <h2>CRM + Facebook Ads Performance Analyzer</h2>
            <p>Upload files, analyze performance, and export executive reports.</p>
          </div>
          <div className="actions">
            <button className="btn secondary" onClick={exportPDF} disabled={!analysis}>Export PDF</button>
            <button className="btn secondary" onClick={exportExcel} disabled={!analysis}>Export Excel</button>
            <button className="btn primary" onClick={runAnalysis} disabled={loading}>{loading ? 'Analyzing...' : 'Run Analysis'}</button>
          </div>
        </header>

        <section className="upload-row">
          <FileDropzone
            label="Upload CRM File (CSV/XLSX)"
            accept=".csv,.xlsx,.xls"
            file={crmFile}
            onFileSelected={setCrmFile}
          />
          <FileDropzone
            label="Upload Facebook Ads Report"
            accept=".csv,.xlsx,.xls"
            file={adsFile}
            onFileSelected={setAdsFile}
          />
        </section>

        {error && <div className="error-banner">{error}</div>}

        <section className="kpi-grid">
          <article className="card">
            <h4>Total Revenue</h4>
            <p>${(kpis.totalRevenue || 0).toLocaleString()}</p>
          </article>
          <article className="card">
            <h4>Total Ad Spend</h4>
            <p>${(kpis.totalSpend || 0).toLocaleString()}</p>
          </article>
          <article className="card">
            <h4>Overall ROAS</h4>
            <p>{(kpis.overallROAS || 0).toFixed(2)}x</p>
          </article>
          <article className="card">
            <h4>Tracked Campaigns</h4>
            <p>{kpis.totalCampaigns || 0}</p>
          </article>
        </section>

        <ChartsPanel analysis={analysis} />

        <section className="insight-grid">
          <article className="card">
            <h3>AI Insights</h3>
            {insights.length === 0 ? <p className="muted">Run analysis to generate smart suggestions.</p> : (
              <ul>
                {insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            )}
          </article>
          <article className="card">
            <h3>Campaign Optimization Recommendations</h3>
            {recommendations.length === 0 ? <p className="muted">Recommendations will appear after analysis.</p> : (
              <ul>
                {recommendations.map((rec) => (
                  <li key={`${rec.campaign}-${rec.recommendation}`}>
                    <strong>{rec.campaign}:</strong> {rec.recommendation}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
