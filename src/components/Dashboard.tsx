import React from 'react';
import { User, UserRole, ReportMetric } from '../types';
import { useData } from '../hooks/useDataContext';
import ChapterPresidentView from './views/ChapterPresidentView';
import FRReportView from './views/FRReportView';
import NDReportView from './views/NDReportView';
import DCReportView from './views/DCReportView';
import AdminView from './views/AdminView';
import SummaryCard from './ui/SummaryCard';
import { FIELD_LABELS, REPORT_FIELDS, MONTHS } from '../constants';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { chapters, getAggregatedData, getChapterReports } = useData();

  const renderSummaryWidgets = () => {
    switch (user.role) {
      case UserRole.ChapterPresident: {
        const reports = getChapterReports(user.unitId);
        const lastReport = reports[0]; // Assumes sorted descending by date in getChapterReports
        if (!lastReport) {
            return (
              <div className="col-span-full bg-white rounded-xl shadow-md p-6 text-center text-slate-500">
                <p>No summary available. Submit your first monthly report to see a summary here.</p>
              </div>
            );
        }
        return (
          <>
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-slate-700">
                Latest Report Summary ({MONTHS[lastReport.month - 1]} {lastReport.year})
              </h3>
            </div>
            {REPORT_FIELDS.map(field => (
                <SummaryCard 
                    key={field}
                    title={FIELD_LABELS[field as keyof ReportMetric]}
                    value={lastReport[field as keyof ReportMetric]}
                    isCurrency={field === 'offering'}
                />
            ))}
          </>
        );
      }
      
      case UserRole.FieldRepresentative:
      case UserRole.NationalDirector:
      case UserRole.DistrictCoordinator:
      case UserRole.DistrictAdmin:
      case UserRole.Admin: {
        const currentYear = new Date().getFullYear();
        const ytdStartDate = `${currentYear}-01-01`;
        const today = new Date().toISOString().split('T')[0];

        const id = user.role === UserRole.Admin ? 'admin' : user.id;
        const data = getAggregatedData(user.role, id, ytdStartDate, today);
        
        if (!data || data.attendance === 0) { // Check for meaningful data
             return (
              <div className="col-span-full bg-white rounded-xl shadow-md p-6 text-center text-slate-500">
                <p>No data available for the current year to generate a summary.</p>
              </div>
            );
        }

        const titleMap: Record<UserRole, string> = {
            [UserRole.FieldRepresentative]: `Area Summary: ${data.name}`,
            [UserRole.NationalDirector]: `Zonal Summary: ${data.name}`,
            [UserRole.DistrictCoordinator]: `District Summary: ${data.name}`,
            [UserRole.DistrictAdmin]: `District Summary: ${data.name}`,
            [UserRole.Admin]: `Overall Summary: ${data.name}`,
            [UserRole.ChapterPresident]: '', // Won't be used here
        };

        return (
          <>
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-slate-700">
                {titleMap[user.role]} (Year-to-Date)
              </h3>
            </div>
            {REPORT_FIELDS.map(field => (
                <SummaryCard 
                    key={field}
                    title={FIELD_LABELS[field as keyof ReportMetric]}
                    value={data[field as keyof ReportMetric]}
                    isCurrency={field === 'offering'}
                />
            ))}
          </>
        )
      }

      default:
        return null;
    }
  };


  const renderMainView = () => {
    switch (user.role) {
      case UserRole.ChapterPresident: {
        const chapter = chapters.find(c => c.id === user.unitId);
        return <ChapterPresidentView chapterName={chapter?.name || 'Unknown Chapter'} chapterId={user.unitId} />;
      }
      case UserRole.FieldRepresentative:
        return <FRReportView frName={user.name} frId={user.id} />;
      case UserRole.NationalDirector:
        return <NDReportView ndName={user.name} ndId={user.id} />;
      case UserRole.DistrictCoordinator:
         return <DCReportView dcName={user.name} dcId={user.id} />;
      case UserRole.DistrictAdmin:
      case UserRole.Admin:
         return <AdminView user={user} />;
      default:
        return <div className="text-center text-red-500">Invalid user role.</div>;
    }
  };

  return (
    <div className="container mx-auto space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Dashboard Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderSummaryWidgets()}
            </div>
        </div>
        <div>
            {renderMainView()}
        </div>
    </div>
  );
};

export default Dashboard;