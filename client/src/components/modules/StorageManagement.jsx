import React, { useState, useEffect, useRef } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  HardDrive,
  Upload,
  RefreshCw,
  Search,
  Trash2,
  Download,
  FileText,
  FileCode,
  FileArchive,
  Image,
  AlertCircle,
  CheckCircle2,
  FolderLock
} from 'lucide-react';

export const StorageManagement = () => {
  const { refreshAllStats, showToast } = useCloud();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const fileInputRef = useRef(null);

  const fetchStorageData = async () => {
    setLoading(true);
    try {
      const res = await api.storage.getSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.storage.upload(formData);
      showToast(res.message, 'success');
      await fetchStorageData();
      await refreshAllStats();
    } catch (err) {
      setUploadError(err.message);
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      const res = await api.storage.delete(fileToDelete._id);
      showToast(res.message, 'success');
      setDeleteModalOpen(false);
      setFileToDelete(null);
      await fetchStorageData();
      await refreshAllStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType = '', name = '') => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (mimeType.includes('image') || ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
      return <Image className="w-4 h-4 text-slateBlue" />;
    }
    if (mimeType.includes('pdf') || ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="w-4 h-4 text-emerald-600" />;
    }
    if (['zip', 'tar', 'gz', '7z'].includes(ext)) {
      return <FileArchive className="w-4 h-4 text-amber-600" />;
    }
    return <FileCode className="w-4 h-4 text-charcoal" />;
  };

  const filesList = data?.files || [];
  const filteredFiles = filesList.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(search.toLowerCase()) ||
      file.fileId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || file.fileType.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Isolated Storage Vault
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">Strict Tenant Partitioning & S3 API Protocol</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Storage Management
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Manage multi-tenant object storage, secure backups, file assets, and disk capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStorageData}
            disabled={loading}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slateBlue' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="cloud-button-primary text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      {/* Storage Utilization Visualizer Card */}
      <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-charcoal">Tenant Storage Capacity</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Physical disk quota allocation and active utilization</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-charcoal">
              {data?.usedStorageGb || 0} <span className="text-xs font-normal text-charcoal/60">/ {data?.totalCapacityGb || 500} GB</span>
            </div>
            <span className="text-xs text-slateBlue font-medium">
              {data?.utilizationPercentage || 0}% Quota Consumed
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-silverGrey/40 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-slateBlue rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(1, data?.utilizationPercentage || 1))}%` }}
          />
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-silverGrey/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slateBlue" />
            <div>
              <span className="text-charcoal/60 text-[11px] block">Documents:</span>
              <span className="font-semibold text-charcoal">{formatFileSize(data?.categoryBreakdown?.documents || 0)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <div>
              <span className="text-charcoal/60 text-[11px] block">Media & Images:</span>
              <span className="font-semibold text-charcoal">{formatFileSize(data?.categoryBreakdown?.images || 0)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <div>
              <span className="text-charcoal/60 text-[11px] block">Archives & Tar:</span>
              <span className="font-semibold text-charcoal">{formatFileSize(data?.categoryBreakdown?.archives || 0)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-charcoal" />
            <div>
              <span className="text-charcoal/60 text-[11px] block">Config & Data:</span>
              <span className="font-semibold text-charcoal">{formatFileSize(data?.categoryBreakdown?.data || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
          dragActive
            ? 'border-slateBlue bg-slateBlue/10 scale-[1.005]'
            : 'border-silverGrey bg-white hover:border-slateBlue hover:bg-warmIvory/20'
        }`}
      >
        <Upload className={`w-9 h-9 mx-auto mb-2 transition-colors ${dragActive ? 'text-slateBlue' : 'text-charcoal/50'}`} />
        <h4 className="text-sm font-semibold text-charcoal">
          {uploading ? 'Processing & Storing Upload...' : 'Drag & drop files here, or browse your device'}
        </h4>
        <p className="text-xs text-charcoal/60 mt-1">
          Isolated per tenant. Maximum file size: 50MB. Files are verified for secure extensions.
        </p>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Files List Table */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search files by name or object ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="all">All File Formats</option>
              <option value="json">JSON / Data</option>
              <option value="pdf">PDF / Documents</option>
              <option value="image">Images</option>
              <option value="gzip">Compressed Archives</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Object ID</th>
                <th className="px-4 py-3">Format Type</th>
                <th className="px-4 py-3">File Size</th>
                <th className="px-4 py-3">Uploaded Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-charcoal/60">
                    No files found in storage vault. Drag and drop a file above to upload.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file._id} className="hover:bg-warmIvory/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slateBlue/10">
                          {getFileIcon(file.fileType, file.originalName)}
                        </div>
                        <span className="font-semibold text-charcoal block truncate max-w-xs">
                          {file.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-charcoal/70">
                      {file.fileId}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="slate" size="sm">
                        {file.fileType.split('/')[1] || file.fileType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-charcoal">
                      {formatFileSize(file.sizeBytes)}
                    </td>
                    <td className="px-4 py-3.5 text-charcoal/70">
                      {new Date(file.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={api.storage.getDownloadUrl(file._id)}
                          download={file.originalName}
                          title="Download File"
                          className="p-1 rounded-md text-charcoal/70 hover:text-slateBlue hover:bg-slateBlue/10 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setFileToDelete(file);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete File"
                          className="p-1 rounded-md text-charcoal/50 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Stored File"
        subtitle="Confirm permanent removal from storage vault"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-charcoal">{fileToDelete?.originalName}</strong>? 
            This action cannot be undone and will immediately free up {formatFileSize(fileToDelete?.sizeBytes)} of storage.
          </p>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
            >
              Confirm & Purge
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StorageManagement;
