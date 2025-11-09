import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { ChapterReport, ReportMetric } from '../../types';
import { MONTHS, REPORT_FIELDS, FIELD_LABELS } from '../../constants';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ChapterPresidentViewProps {
  chapterName: string;
  chapterId: string;
}

const initialFormState: ReportMetric = {
  membership: 0,
  attendance: 0,
  firstTimers: 0,
  salvations: 0,
  holyGhostBaptism: 0,
  membershipDecision: 0,
  offering: 0,
};

const ChapterPresidentView: React.FC<ChapterPresidentViewProps> = ({ chapterName, chapterId }) => {
  const { addChapterReport, getChapterReports } = useData();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [formData, setFormData] = useState<ReportMetric>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDayOfYear);
  const [endDate, setEndDate] = useState(today);

  const reports = getChapterReports(chapterId, startDate, endDate);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) >= 0 ? Number(value) : 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    const report: Omit<ChapterReport, 'id'> = {
      ...formData,
      chapterId,
      chapterName,
      month,
      year,
    };
    
    setTimeout(() => {
        try {
            addChapterReport(report);
            setSubmissionStatus('success');
            setFormData(initialFormState);
        } catch (error) {
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmissionStatus('idle'), 3000);
        }
    }, 500);
  };
  
  const handleExport = () => {
    if (!reports || reports.length === 0) return;
    const headers = ["Month", "Year", ...REPORT_FIELDS.map(f => FIELD_LABELS[f])];
    const rows = reports.map(r => [
        MONTHS[r.month - 1],
        r.year,
        ...REPORT_FIELDS.map(f => r[f])
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Chapter_Report_${chapterName.replace(/ /g, '_')}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Monthly Report Submission</h2>
        <p className="text-slate-600 mb-6">For: <span className="font-semibold">{chapterName}</span></p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-slate-700">Month</label>
              <select id="month" value={month} onChange={e => setMonth(Number(e.target.value))} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-slate-700">Year</label>
              <input type="number" id="year" value={year} onChange={e => setYear(Number(e.target.value))} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {REPORT_FIELDS.map(field => (
                <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-slate-700">{FIELD_LABELS[field]}</label>
                    <input 
                        type="number"
                        id={field}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        min="0"
                        required
                    />
                </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4">
            {submissionStatus === 'success' && <p className="text-green-600">Report submitted successfully!</p>}
            {submissionStatus === 'error' && <p className="text-red-600">Failed to submit report.</p>}
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Past Submissions</h2>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-slate-700">From</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-slate-700">To</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
                </div>
                <Button onClick={handleExport} variant="secondary" disabled={reports.length === 0}>Export Selection</Button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Period</th>
                  {REPORT_FIELDS.map(field => <th key={field} className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{FIELD_LABELS[field]}</th>)}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reports.map(report => (
                  <tr key={report.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{MONTHS[report.month - 1]} {report.year}</td>
                    {REPORT_FIELDS.map(field => <td key={field} className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-mono">{field === 'offering' ? `₦${report[field].toLocaleString()}` : report[field].toLocaleString()}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-slate-500 py-8">No reports found for the selected period.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChapterPresidentView;