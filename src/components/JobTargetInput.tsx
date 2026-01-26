'use client';

import { Sparkles } from 'lucide-react';

interface JobTargetInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function JobTargetInput({ value, onChange, onGenerate, isGenerating }: JobTargetInputProps) {
  return (
    <div className="bg-[#FFFCF7] rounded-3xl shadow-[0_18px_40px_rgba(20,16,12,0.08)] border border-[#E4D7CA] p-6">
      <div className="mb-4">
        <h3 className="font-serif text-xl font-semibold text-[#1B1712] mb-2">
          Target Job Description
        </h3>
        <p className="text-sm text-[#6F6257]">
          Paste the full job description to tailor your resume
        </p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here...

Example:
We're looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and AWS. The ideal candidate will have led teams, shipped products at scale, and demonstrated strong problem-solving abilities..."
        rows={12}
        className="w-full px-4 py-3 border border-[#D9CBBE] rounded-2xl bg-[#F7F2EA] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B] resize-none text-[#1B1712] placeholder:text-[#8B7B6C]"
      />

      <button
        onClick={onGenerate}
        disabled={isGenerating || !value.trim()}
        className="w-full mt-4 py-3 bg-[#1B1712] text-white rounded-full hover:bg-[#2C241C] transition-colors font-medium disabled:bg-[#CBB9A9] disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating Resume...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Tailored Resume
          </>
        )}
      </button>
    </div>
  );
}
