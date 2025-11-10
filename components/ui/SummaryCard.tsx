import React from 'react';
import Card from './Card';

interface SummaryCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isCurrency = false }) => {
  const formattedValue = isCurrency 
    ? `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
    : value.toLocaleString('en-NG');

  return (
    <Card className="text-center">
      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h4>
      <p className="mt-2 text-3xl font-bold text-slate-800 tracking-tight">
        {formattedValue}
      </p>
    </Card>
  );
};

export default SummaryCard;