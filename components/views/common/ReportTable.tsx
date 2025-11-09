import React from 'react';
import { AggregatedData } from '../../../types';
import { FIELD_LABELS, REPORT_FIELDS } from '../../../constants';

interface ReportTableProps {
  data: AggregatedData;
  level: 'FR' | 'ND' | 'DC' | 'Admin';
  comparativeData?: AggregatedData | null;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, comparativeData }) => {

  const formatNumber = (num: number) => num.toLocaleString('en-NG');
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
        return current > 0 ? '∞' : '-';
    }
    const percentage = ((current - previous) / previous) * 100;
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getChangeClassName = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 'text-green-600' : 'text-slate-500';
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metric</th>
            {comparativeData && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Previous Period</th>}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Current Period</th>
            {comparativeData && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Change</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {REPORT_FIELDS.map((field) => (
            <tr key={field} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{FIELD_LABELS[field]}</td>
              
              {comparativeData && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-right font-mono">
                  {field === 'offering' ? `₦${formatNumber(comparativeData[field])}` : formatNumber(comparativeData[field])}
                </td>
              )}

              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right font-mono font-semibold">
                {field === 'offering' ? `₦${formatNumber(data[field])}` : formatNumber(data[field])}
              </td>

              {comparativeData && (
                 <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-semibold ${getChangeClassName(data[field], comparativeData[field])}`}>
                  {calculateChange(data[field], comparativeData[field])}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
