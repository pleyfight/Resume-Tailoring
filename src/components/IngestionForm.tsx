'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface IngestionFormProps {
  onContextTypeChange: (useDocuments: boolean) => void;
  useDocuments: boolean;
  onFormDataChange?: (data: FormData) => void;
}

interface WorkExp {
  company: string;
  job_title: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  duties: string;
  achievements: string;
}

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

interface Skill {
  name: string;
  category: 'Hard' | 'Soft' | 'Tool';
  proficiency: number;
}

interface FormData {
  profile: {
    full_name: string;
    date_of_birth: string;
    phone: string;
    email: string;
    linkedin_url: string;
    portfolio_url: string;
    summary_bio: string;
  };
  work_experiences: WorkExp[];
  educations: Education[];
  skills: Skill[];
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.apple.pages',
]);

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.pages'];

const isAllowedFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  return ALLOWED_MIME_TYPES.has(file.type) || hasAllowedExtension;
};

export function IngestionForm({ onContextTypeChange, useDocuments, onFormDataChange }: IngestionFormProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('manual');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isManualDragOver, setIsManualDragOver] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Manual entry state
  const [profile, setProfile] = useState({
    full_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    linkedin_url: '',
    portfolio_url: '',
    summary_bio: '',
  });

  const [workExperiences, setWorkExperiences] = useState<WorkExp[]>([{
    company: '',
    job_title: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    duties: '',
    achievements: '',
  }]);

  const [educations, setEducations] = useState<Education[]>([{
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
  }]);

  const [skills, setSkills] = useState<Skill[]>([{
    name: '',
    category: 'Hard',
    proficiency: 50,
  }]);

  // Notify parent of form data changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        profile,
        work_experiences: workExperiences,
        educations,
        skills,
      });
    }
  }, [profile, workExperiences, educations, skills, onFormDataChange]);

  // Auto-dismiss toast after 20 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handleTabChange = (tab: 'upload' | 'manual') => {
    setActiveTab(tab);
    onContextTypeChange(tab === 'upload');
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setUploadProgress(30);

    const formData = new window.FormData();
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Please log in to upload documents.');

      const response = await fetch('/api/ingest/document', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      setUploadProgress(70);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      
      // Show success toast instead of alert
      setToastMessage(` Upload Complete: ${file.name}`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Upload error:', error);
      setToastMessage(` Upload Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowSuccessToast(true);
      setUploadProgress(0);
      setUploadedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && isAllowedFile(file)) {
      handleFileUpload(file);
    } else {
      setToastMessage(' Please upload a DOC, DOCX, PDF, TXT, or PAGES file');
      setShowSuccessToast(true);
    }
  };

  const handleManualDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (Array.from(e.dataTransfer.types).includes('Files')) {
      setIsManualDragOver(true);
    }
  };

  const handleManualDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsManualDragOver(false);
  };

  const handleManualDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsManualDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && isAllowedFile(file)) {
      handleTabChange('upload');
      handleFileUpload(file);
      return;
    }

    setToastMessage(' Please upload a DOC, DOCX, PDF, TXT, or PAGES file');
    setShowSuccessToast(true);
  };

  const handleSaveManual = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Please log in to save your information.');

      const response = await fetch('/api/ingest/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          profile,
          work_experiences: workExperiences,
          educations,
          skills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save data');
      }

      setToastMessage(' Information saved successfully!');
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Save error:', error);
      setToastMessage(` Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowSuccessToast(true);
    }
  };

  return (
    <div className="bg-[#FFFCF7] rounded-3xl shadow-[0_18px_40px_rgba(20,16,12,0.08)] border border-[#E4D7CA] overflow-hidden relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-[fade-up_0.4s_ease-out]">
          <div className="bg-[#FFFCF7] border border-[#E4D7CA] shadow-lg rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#8B5B2B]" />
              <span className="text-sm font-medium text-[#1B1712]">{toastMessage}</span>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-[#8B7B6C] hover:text-[#1B1712]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E4D7CA] bg-[#FFF9F1]">
        <button
          onClick={() => handleTabChange('manual')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-[#1B1712] border-b-2 border-[#1B1712]'
              : 'text-[#8B7B6C] hover:text-[#1B1712]'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => handleTabChange('upload')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'upload'
              ? 'text-[#1B1712] border-b-2 border-[#1B1712]'
              : 'text-[#8B7B6C] hover:text-[#1B1712]'
          }`}
        >
          Upload Resume
        </button>
      </div>

      <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {activeTab === 'upload' ? (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-[#1B1712] bg-[#F7F2EA]'
                  : 'border-[#D9CBBE] hover:border-[#8B7B6C]'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-[#8B7B6C]" />
              <p className="text-[#1B1712] font-medium mb-2">
                Drop your resume here, or click to browse
              </p>
              <p className="text-sm text-[#6F6257] mb-4">
                Supports DOC, DOCX, PDF, TXT, and PAGES files
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.pages"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 bg-[#1B1712] text-white rounded-lg cursor-pointer hover:bg-[#2C241C] transition-colors"
              >
                Choose File
              </label>
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F6257]">{uploadedFile?.name}</span>
                  <span className="text-[#1B1712] font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-[#E4D7CA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1B1712] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="relative"
            onDragOver={handleManualDragOver}
            onDragLeave={handleManualDragLeave}
            onDrop={handleManualDrop}
          >
            {isManualDragOver && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#F7F2EA]/80">
                <div className="flex flex-col items-center gap-2 text-sm font-semibold text-[#1B1712] animate-[pulse-soft_1.2s_ease-in-out_infinite]">
                  <Upload className="h-6 w-6 text-[#8B5B2B]" />
                  Upload resume
                </div>
              </div>
            )}
            <div className={`space-y-6 ${isManualDragOver ? 'pointer-events-none opacity-60' : ''}`}>
            {/* Basic Info Accordion */}
            <details className="group" open>
              <summary className="flex justify-between items-center cursor-pointer list-none font-serif text-lg font-semibold text-[#1B1712] mb-4">
                Basic Information
                <span className="text-[#8B7B6C] group-open:rotate-180 transition-transform"></span>
              </summary>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#D9CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="px-4 py-2 border border-[#D9CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="px-4 py-2 border border-[#D9CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                  />
                </div>
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 border border-[#D9CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                />
                <input
                  type="url"
                  placeholder="Portfolio URL"
                  value={profile.portfolio_url}
                  onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                  className="w-full px-4 py-2 border border-[#D9CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                />
                <textarea
                  placeholder="Professional Summary"
                  value={profile.summary_bio}
                  onChange={(e) => setProfile({ ...profile, summary_bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-[#D9CBBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B] resize-none"
                />
              </div>
            </details>

            {/* Work History Accordion */}
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none font-serif text-lg font-semibold text-[#1B1712] mb-4">
                Work History
                <span className="text-[#8B7B6C] group-open:rotate-180 transition-transform"></span>
              </summary>
              <div className="space-y-4">
                {workExperiences.map((exp, index) => (
                  <div key={index} className="p-4 border border-[#E4D7CA] rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#6F6257]">Position {index + 1}</span>
                      {workExperiences.length > 1 && (
                        <button
                          onClick={() => setWorkExperiences(workExperiences.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...workExperiences];
                        updated[index].company = e.target.value;
                        setWorkExperiences(updated);
                      }}
                      className="w-full px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.job_title}
                      onChange={(e) => {
                        const updated = [...workExperiences];
                        updated[index].job_title = e.target.value;
                        setWorkExperiences(updated);
                      }}
                      className="w-full px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => {
                        const updated = [...workExperiences];
                        updated[index].location = e.target.value;
                        setWorkExperiences(updated);
                      }}
                      className="w-full px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={exp.start_date}
                        onChange={(e) => {
                          const updated = [...workExperiences];
                          updated[index].start_date = e.target.value;
                          setWorkExperiences(updated);
                        }}
                        className="px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={exp.end_date}
                        onChange={(e) => {
                          const updated = [...workExperiences];
                          updated[index].end_date = e.target.value;
                          setWorkExperiences(updated);
                        }}
                        disabled={exp.is_current}
                        className="px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B] disabled:bg-[#F7F2EA]"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exp.is_current}
                        onChange={(e) => {
                          const updated = [...workExperiences];
                          updated[index].is_current = e.target.checked;
                          if (e.target.checked) updated[index].end_date = '';
                          setWorkExperiences(updated);
                        }}
                        className="rounded"
                      />
                      <span className="text-[#6F6257]">I currently work here</span>
                    </label>
                    <textarea
                      placeholder="Duties (What you did on a daily basis)"
                      value={exp.duties}
                      onChange={(e) => {
                        const updated = [...workExperiences];
                        updated[index].duties = e.target.value;
                        setWorkExperiences(updated);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B] resize-none"
                    />
                    <textarea
                      placeholder=" Key Achievements (I increased X by Y%, Led Z initiative...)"
                      value={exp.achievements}
                      onChange={(e) => {
                        const updated = [...workExperiences];
                        updated[index].achievements = e.target.value;
                        setWorkExperiences(updated);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-amber-300 bg-amber-50 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none placeholder:text-amber-700"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setWorkExperiences([...workExperiences, {
                    company: '',
                    job_title: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    is_current: false,
                    duties: '',
                    achievements: '',
                  }])}
                  className="w-full py-2 border-2 border-dashed border-[#D9CBBE] rounded-lg text-[#6F6257] hover:border-[#1B1712] hover:text-[#1B1712] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Position
                </button>
              </div>
            </details>

            {/* Skills */}
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none font-serif text-lg font-semibold text-[#1B1712] mb-4">
                Skills & Education
                <span className="text-[#8B7B6C] group-open:rotate-180 transition-transform"></span>
              </summary>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-[#1B1712]">Education</h4>
                  {educations.map((edu, index) => (
                    <div key={index} className="p-4 border border-[#E4D7CA] rounded-lg space-y-3">
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[index].institution = e.target.value;
                          setEducations(updated);
                        }}
                        className="w-full px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...educations];
                            updated[index].degree = e.target.value;
                            setEducations(updated);
                          }}
                          className="px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                        />
                        <input
                          type="text"
                          placeholder="Field of Study"
                          value={edu.field_of_study}
                          onChange={(e) => {
                            const updated = [...educations];
                            updated[index].field_of_study = e.target.value;
                            setEducations(updated);
                          }}
                          className="px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-[#1B1712]">Skills</h4>
                  {skills.map((skill, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => {
                          const updated = [...skills];
                          updated[index].name = e.target.value;
                          setSkills(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                      />
                      <select
                        value={skill.category}
                        onChange={(e) => {
                          const updated = [...skills];
                          updated[index].category = e.target.value as 'Hard' | 'Soft' | 'Tool';
                          setSkills(updated);
                        }}
                        className="px-3 py-2 border border-[#D9CBBE] rounded focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20 focus:border-[#8B5B2B]"
                      >
                        <option value="Hard">Technical</option>
                        <option value="Tool">Tool</option>
                        <option value="Soft">Soft</option>
                      </select>
                    </div>
                  ))}
                  <button
                    onClick={() => setSkills([...skills, { name: '', category: 'Hard', proficiency: 50 }])}
                    className="w-full py-2 border-2 border-dashed border-[#D9CBBE] rounded-lg text-[#6F6257] hover:border-[#1B1712] hover:text-[#1B1712] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>
              </div>
            </details>

            <button
              onClick={handleSaveManual}
              className="w-full py-3 bg-[#1B1712] text-white rounded-full hover:bg-[#2C241C] transition-colors font-medium"
            >
              Save Information
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
