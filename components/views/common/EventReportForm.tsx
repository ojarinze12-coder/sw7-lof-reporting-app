import React, { useState } from 'react';
import { useData } from '../../../hooks/useDataContext';
import { EventReport, ReportMetric, UserRole, EventType } from '../../../types';
import { REPORT_FIELDS, FIELD_LABELS } from '../../../constants';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface EventReportFormProps {
  reportingOfficerId: string;
  officerRole: UserRole;
}

const initialFormState: ReportMetric & { eventName: string; eventDate: string; eventType: EventType } = {
  eventName: '',
  eventDate: new Date().toISOString().split('T')[0],
  eventType: EventType.Meeting,
  membership: 0,
  attendance: 0,
  firstTimers: 0,
  salvations: 0,
  holyGhostBaptism: 0,
  membershipDecision: 0,
  offering: 0,
};

const EventReportForm: React.FC<EventReportFormProps> = ({ reportingOfficerId, officerRole }) => {
  const { addEventReport } = useData();
  
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: Number(value) >= 0 ? Number(value) : 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    const report: Omit<EventReport, 'id'> = {
      ...formData,
      reportingOfficerId,
      officerRole,
    };
    
    setTimeout(() => {
        try {
            addEventReport(report);
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

  return (
    <Card>
      <h3 className="text-xl font-bold text-slate-800 mb-4">Submit Event/Meeting Report</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-slate-700">Event Name</label>
            <input type="text" id="eventName" name="eventName" value={formData.eventName} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700">Event Date</label>
            <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
          </div>
        </div>

        <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-slate-700">Event Type</label>
            <select id="eventType" name="eventType" value={formData.eventType} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                {Object.values(EventType).map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
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
          {submissionStatus === 'success' && <p className="text-green-600 text-sm">Event submitted!</p>}
          {submissionStatus === 'error' && <p className="text-red-600 text-sm">Submission failed.</p>}
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EventReportForm;
