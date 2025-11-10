
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AggregatedData, UserRole } from '../../../types';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface SummaryGeneratorProps {
  data: AggregatedData;
  role: UserRole;
  name: string;
}

interface SummaryData {
  opening_remark: string;
  key_achievements: string[];
  areas_for_focus: string[];
  concluding_remark: string;
}

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ data, role, name }) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummaryData(null);

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      setError("API key is not configured. This feature is currently unavailable. Please contact the administrator.");
      setIsLoading(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const dataString = JSON.stringify(data, (key, value) => 
        (key === 'reports' || key === 'events' || key === 'children') ? undefined : value, 2);
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            opening_remark: { type: Type.STRING, description: "A brief, encouraging opening statement." },
            key_achievements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of strings, each describing a key achievement." },
            areas_for_focus: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of strings, each describing an area for focus, framed constructively." },
            concluding_remark: { type: Type.STRING, description: "A motivational and forward-looking concluding statement." }
        },
        required: ["opening_remark", "key_achievements", "areas_for_focus", "concluding_remark"]
    };

    const prompt = `
      You are a data analyst for FGBMFI-Nigeria, Ladies of the Fellowship.
      Your task is to provide a concise, encouraging, and insightful summary of a performance report for ${name}, a ${role}.

      Analyze the following aggregated report data:
      ${dataString}

      Instructions for your analysis:
      - Your response must be in the specified JSON format.
      - Base your analysis strictly on the provided data.
      - For Key Achievements, highlight 2-3 key strengths (e.g., high salvation numbers, significant growth in membership).
      - For Areas for Focus, gently point out 1-2 areas that might need more attention (e.g., attendance vs. membership ratio). Frame this constructively as an opportunity for growth.
      - Ensure all remarks are professional, warm, and tailored to the context of a faith-based fellowship.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
      });
      const responseText = response.text;
      if (responseText) {
          const parsedSummary = JSON.parse(responseText);
          setSummaryData(parsedSummary);
      } else {
        throw new Error("Model returned an empty response.");
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the summary. The model may have returned an unexpected response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [data, role, name]);

  return (
    <Card className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-slate-800">AI-Powered Report Summary</h3>
        <Button onClick={generateSummary} isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate AI Summary'}
        </Button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      
      {summaryData && !isLoading && (
        <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200 space-y-4 text-slate-700">
            <p className="italic">{summaryData.opening_remark}</p>
            
            <div>
                <h4 className="font-semibold text-slate-800">Key Achievements:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                    {summaryData.key_achievements.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
            
            <div>
                <h4 className="font-semibold text-slate-800">Areas for Focus:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                    {summaryData.areas_for_focus.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>

            <p className="font-semibold">{summaryData.concluding_remark}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4 p-8 text-center bg-slate-50 rounded-md">
            <p className="text-slate-500 animate-pulse">Generating your report summary, please wait...</p>
        </div>
      )}

    </Card>
  );
};

export default SummaryGenerator;