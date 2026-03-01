import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Trash2, Edit, List, Database, 
  X, Check, Loader2, Filter, RefreshCw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/dbp';

function DatabaseOperations() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total_professors: 0 });
  
  // Form states
  const [formData, setFormData] = useState({
    id: '',
    root_url: '',
    name: '',
    university: '',
    profile_data: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  // Load professors on mount
  useEffect(() => {
    loadProfessors();
    loadStats();
  }, []);

  const loadProfessors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/professors`);
      const data = await response.json();
      if (data.success) {
        setProfessors(data.data);
      } else {
        setError(data.error || 'Failed to load professors');
      }
    } catch (err) {
      setError('Connection failed. Please verify the server status.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProfessors();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/professors/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) {
        setProfessors(data.data);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Search failed. Please verify the server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this professor?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/professors/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Professor deleted successfully');
        loadProfessors();
        loadStats();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed. Please verify the server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (professor) => {
    setSelectedProfessor(professor);
    setFormData({
      id: professor.id,
      root_url: professor.root_url,
      name: professor.name,
      university: professor.university,
      profile_data: typeof professor.profile_data === 'string' 
        ? professor.profile_data 
        : JSON.stringify(professor.profile_data, null, 2)
    });
    setFormMode('edit');
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedProfessor(null);
    setFormData({
      id: '',
      root_url: '',
      name: '',
      university: '',
      profile_data: '{}'
    });
    setFormMode('create');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let profileData;
      try {
        profileData = JSON.parse(formData.profile_data);
      } catch (err) {
        throw new Error('Invalid JSON in profile_data field');
      }

      const payload = {
        root_url: formData.root_url,
        name: formData.name,
        university: formData.university,
        profile_data: profileData
      };

      let response;
      if (formMode === 'create') {
        response = await fetch(`${API_BASE}/professors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/professors/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(`Professor ${formMode === 'create' ? 'created' : 'updated'} successfully`);
        setShowForm(false);
        loadProfessors();
        loadStats();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || `${formMode === 'create' ? 'Create' : 'Update'} failed`);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetById = async () => {
    if (!formData.id) {
      setError('Please enter an ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/professors/${formData.id}`);
      const data = await response.json();
      if (data.success) {
        setProfessors([data.data]);
        setActiveTab('list');
      } else {
        setError(data.error || 'Professor not found');
      }
    } catch (err) {
      setError('Failed to fetch professor');
    } finally {
      setLoading(false);
    }
  };

  const handleGetByUrl = async () => {
    if (!formData.root_url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/professors/url/${encodeURIComponent(formData.root_url)}`);
      const data = await response.json();
      if (data.success) {
        setProfessors([data.data]);
        setActiveTab('list');
      } else {
        setError(data.error || 'Professor not found');
      }
    } catch (err) {
      setError('Failed to fetch professor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Database className="w-8 h-8 text-black" />
            <h1 className="text-4xl font-bold tracking-tight">Database Operations</h1>
          </div>
          <p className="text-gray-500">Manage professor database records</p>
        </div>

        {/* Stats */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-mono text-gray-600">
                Total Professors: <span className="font-bold text-black">{stats.total_professors}</span>
              </span>
            </div>
            <button
              onClick={() => { loadProfessors(); loadStats(); }}
              className="flex items-center space-x-2 px-3 py-1 text-xs font-mono border border-gray-300 hover:border-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {['list', 'query', 'create'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, university, or URL..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:border-black outline-none text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
              <button
                onClick={loadProfessors}
                className="px-4 py-2 border border-gray-200 hover:border-black text-sm font-mono uppercase tracking-wider"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Professors Table */}
            {loading && professors.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : professors.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No professors found
              </div>
            ) : (
              <div className="border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider">University</th>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider">URL</th>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professors.map((prof) => (
                      <tr key={prof.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{prof.id}</td>
                        <td className="px-4 py-3">{prof.name || '-'}</td>
                        <td className="px-4 py-3">{prof.university || '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-xs">
                          {prof.root_url || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(prof)}
                              className="p-1 hover:bg-gray-200 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prof.id)}
                              className="p-1 hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Query Tab */}
        {activeTab === 'query' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Get by ID */}
              <div className="border border-gray-200 p-4">
                <h3 className="text-sm font-mono uppercase tracking-wider mb-3">Get by ID</h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="Professor ID"
                    className="flex-1 px-3 py-2 border border-gray-200 focus:border-black outline-none text-sm"
                  />
                  <button
                    onClick={handleGetById}
                    disabled={loading}
                    className="px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get'}
                  </button>
                </div>
              </div>

              {/* Get by URL */}
              <div className="border border-gray-200 p-4">
                <h3 className="text-sm font-mono uppercase tracking-wider mb-3">Get by URL</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.root_url}
                    onChange={(e) => setFormData({ ...formData, root_url: e.target.value })}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 border border-gray-200 focus:border-black outline-none text-sm"
                  />
                  <button
                    onClick={handleGetByUrl}
                    disabled={loading}
                    className="px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div>
            <button
              onClick={handleCreate}
              className="mb-4 px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-800 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Professor</span>
            </button>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    {formMode === 'create' ? 'Create Professor' : 'Edit Professor'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wide">
                      Root URL *
                    </label>
                    <input
                      type="text"
                      value={formData.root_url}
                      onChange={(e) => setFormData({ ...formData, root_url: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 focus:border-black outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wide">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 focus:border-black outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wide">
                      University *
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 focus:border-black outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wide">
                      Profile Data (JSON) *
                    </label>
                    <textarea
                      value={formData.profile_data}
                      onChange={(e) => setFormData({ ...formData, profile_data: e.target.value })}
                      required
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-200 focus:border-black outline-none text-sm font-mono"
                      placeholder='{"identity": {...}, "research_signals": {...}}'
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-black text-white text-sm font-mono uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{formMode === 'create' ? 'Create' : 'Update'}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-200 hover:border-black text-sm font-mono uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DatabaseOperations;

