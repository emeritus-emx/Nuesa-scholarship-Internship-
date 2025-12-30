
import React, { useState, useRef } from 'react';
import { User, DOCUMENTS_LIST } from '../types';
import { User as UserIcon, BookOpen, Save, Mail, Phone, MapPin, Calendar, Building, Award, Fingerprint, FileText, Upload, Trash2, CheckCircle, File as FileIcon, Search, X, Eye, CreditCard, Lock, Hash, ShieldCheck, Camera } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

interface DocumentUploadCardProps {
    docName: string;
    formData: User;
    uploadingDoc: string | null;
    onUpload: (docName: string, file: File) => void;
    onRemove: (docName: string) => void;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({ docName, formData, uploadingDoc, onUpload, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadedData = formData.documents?.[docName];
    const isUploading = uploadingDoc === docName;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all group relative">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-snug mb-1">{docName}</h4>
                    {uploadedData ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                             <CheckCircle size={12} />
                             <span className="truncate max-w-[150px]">{uploadedData.name}</span>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Not uploaded</p>
                    )}
                </div>
                
                <div>
                    {uploadedData ? (
                        <button 
                            type="button"
                            onClick={() => onRemove(docName)}
                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove file"
                        >
                            <Trash2 size={16} />
                        </button>
                    ) : (
                         <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`p-2 rounded-lg transition-colors ${isUploading ? 'bg-gray-100 dark:bg-gray-700' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'}`}
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Upload size={16} />
                            )}
                        </button>
                    )}
                </div>
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                    if(e.target.files?.[0]) onUpload(docName, e.target.files[0]);
                }} 
            />
            
            {/* Progress Bar Visual for Uploading */}
            {isUploading && (
                <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-pulse w-full rounded-b-xl"></div>
            )}
        </div>
    );
};

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'academic' | 'documents' | 'bank'>('bio');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  // Document Search & Management State
  const [docSearch, setDocSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState<User>(user);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleFileUpload = (docName: string, file: File) => {
    setUploadingDoc(docName);
    // Simulate upload delay
    setTimeout(() => {
        const newDocs = {
            ...(formData.documents || {}),
            [docName]: {
                name: file.name,
                date: new Date().toLocaleDateString()
            }
        };
        setFormData(prev => ({ ...prev, documents: newDocs }));
        setUploadingDoc(null);
    }, 1500);
  };

  const handleRemoveFile = (docName: string) => {
      const promptMsg = "This action will permanently remove this item. Continue?";
      if (window.confirm(promptMsg)) {
          if (window.confirm(promptMsg)) {
              const newDocs = { ...(formData.documents || {}) };
              delete newDocs[docName];
              setFormData(prev => ({ ...prev, documents: newDocs }));
          }
      }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API save
    setTimeout(() => {
        onUpdate(formData);
        setLoading(false);
        setSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  const InputGroup = ({ label, name, type = "text", icon: Icon, placeholder, disabled = false, maxLength }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={type}
          name={name}
          value={(formData as any)[name] || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${disabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900'} outline-none transition-all`}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden group">
            
            {/* Profile Picture Upload */}
            <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="w-full h-full rounded-full border-4 border-green-100 dark:border-green-900/50 shadow-lg overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                    {formData.profilePicture ? (
                        <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <UserIcon size={40} className="text-gray-400" />
                        </div>
                    )}
                </div>
                <button 
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md transition-all transform hover:scale-110"
                    title="Change Profile Picture"
                >
                    <Camera size={16} />
                </button>
                <input 
                    type="file" 
                    ref={profileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-wider">
               Student Account
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-2 space-y-1">
              {[
                { id: 'bio', label: 'Bio Data', icon: Fingerprint },
                { id: 'academic', label: 'Academic Info', icon: BookOpen },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'bank', label: 'Bank Details', icon: CreditCard },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Progress Widget */}
          <div className="bg-green-600 rounded-3xl p-6 text-white shadow-lg shadow-green-200 dark:shadow-none">
             <div className="flex items-center justify-between mb-2">
                 <h4 className="font-bold">Profile Strength</h4>
                 <span className="text-sm font-bold">85%</span>
             </div>
             <div className="w-full bg-black/20 rounded-full h-2 mb-4">
                 <div className="bg-white h-2 rounded-full w-[85%]"></div>
             </div>
             <p className="text-xs text-green-100">Complete your documents section to reach 100% and unlock expedited applications.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {activeTab === 'bio' && 'Personal Information'}
                        {activeTab === 'academic' && 'Academic Records'}
                        {activeTab === 'documents' && 'Required Documents'}
                        {activeTab === 'bank' && 'Bank Account Details'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {activeTab === 'bio' && 'Manage your personal details and contact info.'}
                        {activeTab === 'academic' && 'Keep your educational background up to date.'}
                        {activeTab === 'documents' && 'Upload necessary files for scholarship applications.'}
                        {activeTab === 'bank' && 'Securely provide your banking information for payouts.'}
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg"
                >
                    {loading ? 'Saving...' : (
                        <>
                            <Save size={18} />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-300 animate-fade-in">
                    <CheckCircle size={20} />
                    <span className="font-medium">Profile updated successfully!</span>
                </div>
            )}

            {activeTab === 'bio' && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                <InputGroup label="Full Name" name="name" icon={UserIcon} placeholder="John Doe" />
                <InputGroup label="Email Address" name="email" type="email" icon={Mail} placeholder="john@example.com" disabled />
                <InputGroup label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+234 800 000 0000" />
                <InputGroup label="Date of Birth" name="dob" type="date" icon={Calendar} />
                <div className="md:col-span-2">
                    <InputGroup label="Residential Address" name="address" icon={MapPin} placeholder="123 University Road, Lagos" />
                </div>
                <InputGroup label="State of Origin" name="stateOfOrigin" icon={MapPin} placeholder="Lagos State" />
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">Gender</label>
                     <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                             <UserIcon size={18} />
                        </div>
                        <select 
                            name="gender" 
                            value={formData.gender || ''} 
                            onChange={handleChange as any}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 outline-none appearance-none"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                     </div>
                </div>
                <div className="md:col-span-2">
                     <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">Bio / Summary</label>
                     <textarea 
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 outline-none h-32"
                        placeholder="Tell us a bit about yourself..."
                     />
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                <div className="md:col-span-2">
                    <InputGroup label="Institution Name" name="institution" icon={Building} placeholder="University of Lagos" />
                </div>
                <InputGroup label="Faculty" name="faculty" icon={BookOpen} placeholder="Engineering" />
                <InputGroup label="Department" name="department" icon={BookOpen} placeholder="Computer Engineering" />
                <InputGroup label="Current Level" name="level" icon={Award} placeholder="300 Level" />
                <InputGroup label="Matric Number" name="matricNumber" icon={Fingerprint} placeholder="170805000" />
                <InputGroup label="Current CGPA" name="cgpa" icon={Award} placeholder="4.50" />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6 animate-fade-in">
                {/* Document Search / Filter */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search for a document to upload..." 
                            value={docSearch}
                            onChange={(e) => setDocSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                </div>

                {/* Uploaded Documents Preview */}
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                    <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                        <FileIcon size={16} /> My Uploaded Documents ({Object.keys(formData.documents || {}).length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(formData.documents || {}).map(([key, file]) => (
                            <div key={key} className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
                                <span className="font-medium truncate max-w-[150px]">{key}</span>
                                <button type="button" onClick={() => handleRemoveFile(key)} className="text-red-400 hover:text-red-600">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {Object.keys(formData.documents || {}).length === 0 && (
                            <p className="text-xs text-gray-500 italic">No documents uploaded yet.</p>
                        )}
                    </div>
                </div>

                {/* Document List */}
                <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar p-1">
                    {DOCUMENTS_LIST.filter(d => d.toLowerCase().includes(docSearch.toLowerCase())).map((doc) => (
                        <DocumentUploadCard 
                            key={doc} 
                            docName={doc} 
                            formData={formData} 
                            uploadingDoc={uploadingDoc} 
                            onUpload={handleFileUpload} 
                            onRemove={handleRemoveFile} 
                        />
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Secure Information</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                Your bank details are encrypted and only used for processing grant and scholarship payouts. 
                                Please ensure the account name matches your registered name.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <InputGroup label="Bank Name" name="bankName" icon={Building} placeholder="e.g. First Bank, GTBank" />
                        </div>
                        <InputGroup 
                            label="Account Number" 
                            name="accountNumber" 
                            icon={Hash} 
                            placeholder="0123456789" 
                            maxLength={10} 
                        />
                        <InputGroup label="Account Name" name="accountName" icon={UserIcon} placeholder="John Doe" />
                        <InputGroup 
                            label="Bank Verification Number (BVN)" 
                            name="bvn" 
                            icon={ShieldCheck} 
                            placeholder="22222222222" 
                            maxLength={11} 
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                            <Lock size={12} /> Data is transmitted securely via SSL.
                        </p>
                    </div>
                </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
