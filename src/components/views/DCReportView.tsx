import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { UserRole, AggregatedData } from '../../types';
import { REPORT_FIELDS, FIELD_LABELS } from '../../constants';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ReportTable from './common/ReportTable';
import SummaryGenerator from './common/SummaryGenerator';
import EventReportForm from './common/EventReportForm';
import BarChart from './common/BarChart';

interface DCReportViewProps {
  dcName: string;
  dcId: string;
  isAdminView?: boolean;
}

const getPreviousPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return {
        prevStart: prevStart.toISOString().split('T')[0],
        prevEnd: prevEnd.toISOString().split('T')[0],
    };
};

const DCReportView: React.FC<DCReportViewProps> = ({ dcName, dcId, isAdminView = false }) => {
  const { getAggregatedData } = useData();
  const role = isAdminView ? UserRole.Admin : UserRole.DistrictCoordinator;
  const name = isAdminView ? "Admin" : dcName;
  const id = isAdminView ? "admin" : dcId;

  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfYear);
  const [endDate, setEndDate] = useState(today);
  const [isComparing, setIsComparing] = useState(false);
  const [comparativeData, setComparativeData] = useState<AggregatedData | null>(null);

  const data = getAggregatedData(role, id, startDate, endDate);

  useEffect(() => {
    if (isComparing && startDate && endDate) {
        const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);
        const prevData = getAggregatedData(role, id, prevStart, prevEnd);
        setComparativeData(prevData);
    } else {
        setComparativeData(null);
    }
  }, [isComparing, startDate, endDate, id, role, getAggregatedData]);

  const handleExport = () => {
    if (!data) return;
    const headers = ["Metric", "Total"];
    const rows = REPORT_FIELDS.map(field => [FIELD_LABELS[field], data[field]]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const fileName = isAdminView ? 'Admin_Report' : `DC_Report_${dcName.replace(/ /g, '_')}`;
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const title = isAdminView ? "Admin Dashboard (District Overview)" : "District Coordinator Dashboard";
  const welcomeName = isAdminView ? "Admin" : dcName;
  const summaryTitle = isAdminView ? "Overall District Summary" : "My District Summary (incl. Events)";
  
  if (!data) {
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-lg text-slate-600 mb-6">Welcome, <span className="font-semibold">{welcomeName}</span></p>
            <Card><p>No data available for the selected period.</p></Card>
        </div>
    );
  }

  const chartData = REPORT_FIELDS.map(field => ({
      name: FIELD_LABELS[field].replace(' (₦)', ''),
      value: data[field],
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-lg text-slate-600">Welcome, <span className="font-semibold">{welcomeName}</span></p>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-slate-700">From</label>
                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
            </div>
            <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-slate-700">To</label>
                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
            </div>
            <div className="flex items-center h-10">
                <input id="compare-checkbox-dc" type="checkbox" checked={isComparing} onChange={(e) => setIsComparing(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                <label htmlFor="compare-checkbox-dc" className="ml-2 block text-sm text-gray-900">Compare Periods</label>
            </div>
            <Button onClick={handleExport} variant="secondary">Export Summary (CSV)</Button>
        </div>
      </Card>
      
      <Card>
          <BarChart data={chartData} title="Performance Overview" />
      </Card>

      <div className={`grid grid-cols-1 ${!isAdminView ? 'lg:grid-cols-2' : ''} gap-6`}>
        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-slate-800 mb-4">{summaryTitle}</h3>
            <ReportTable data={data} level="DC" comparativeData={comparativeData} />
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-slate-800 mb-4">{isAdminView ? "Zones" : "Supervised Zones"}</h3>
            {data.children && data.children.length > 0 ? (
                <ul className="space-y-3">
                    {data.children.map(zoneData => (
                        <li key={zoneData.name} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                            <p className="font-semibold text-slate-700">{zoneData.name}</p>
                            <p className="text-sm text-slate-500">Attendance: {zoneData.attendance.toLocaleString()} | Salvations: {zoneData.salvations.toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-500">No zone data in selected period.</p>
            )}
           </Card>
        </div>

        {!isAdminView && (
            <div className="space-y-6">
                <EventReportForm reportingOfficerId={dcId} officerRole={UserRole.DistrictCoordinator} />
                <Card>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">My Submitted Events</h3>
                    {data.events && data.events.length > 0 ? (
                        <ul className="space-y-3 max-h-60 overflow-y-auto">
                            {data.events.map(event => (
                                <li key={event.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <p className="font-semibold text-slate-700">{event.eventName} <span className="text-xs font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{event.eventType}</span></p>
                                    <p className="text-sm text-slate-500">Date: {new Date(event.eventDate).toLocaleDateString()} | Attendance: {event.attendance.toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">You have not submitted any event reports in this period.</p>
                    )}
                </Card>
            </div>
        )}
      </div>
      
      <SummaryGenerator data={data} role={role} name={name} />
    </div>
  );
};

export default DCReportView;