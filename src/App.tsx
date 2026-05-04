import React, { useState, useEffect } from 'react';
import { 
  SmartphoneNfc, 
  Users, 
  Smartphone, 
  LogOut, 
  Share, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Database,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Filter,
  Download,
  Edit,
  Trash2,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import McpExplorer from './components/McpExplorer';

const AssignDeviceModal = ({ 
  isOpen, 
  devicesToAssign,
  token, 
  onClose, 
  onAssign 
}: { 
  isOpen: boolean; 
  devicesToAssign: {deviceId: string; name: string}[]; 
  token: string | null; 
  onClose: () => void; 
  onAssign: (deviceIds: string[], sifra: string) => void; 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers?limit=10&search=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          setResults(body.data || []);
        }
      } catch (e) {}
      setLoading(false);
    };
    
    const timeout = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timeout);
  }, [query, isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Assign Device{devicesToAssign.length !== 1 ? 's' : ''}</h3>
            {devicesToAssign.length === 1 ? (
              <p className="text-xs text-slate-500">{devicesToAssign[0].name} ({devicesToAssign[0].deviceId})</p>
            ) : (
              <p className="text-xs text-slate-500">{devicesToAssign.length} devices selected</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search by customer name or sifra..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-2 flex-1">
          <button
            onClick={() => onAssign(devicesToAssign.map(d => d.deviceId), '')}
            className="w-full text-left p-3 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors flex items-center gap-3 text-slate-700 font-medium mb-4 border border-slate-200 border-dashed group"
          >
            <div className="p-1.5 rounded-md bg-white border border-slate-200 group-hover:border-red-200 group-hover:bg-red-100 transition-colors">
               <Trash2 size={16} className="text-slate-400 group-hover:text-red-500" />
            </div>
            Remove Assignment
          </button>
          
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">No customers found</div>
          ) : (
            <div className="space-y-1">
              {results.map(c => (
                <button
                  key={c.sifra}
                  onClick={() => onAssign(devicesToAssign.map(d => d.deviceId), c.sifra)}
                  className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors text-sm">{c.naziv}</div>
                    <div className="text-xs text-slate-500">{c.sifra}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};


const EditRecordModal = ({ 
  isOpen, 
  collectionName,
  initialRecord,
  token,
  onClose,
  onSave
}: { 
  isOpen: boolean; 
  collectionName: string;
  initialRecord: any;
  token: string | null; 
  onClose: () => void; 
  onSave: () => void; 
}) => {
  const [record, setRecord] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRecord(initialRecord || {});
  }, [initialRecord]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!record._id) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/db/collection/${collectionName}/${record._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const body = await res.json();
        alert(body.error || 'Failed to save');
      }
    } catch (e) {
      alert('Error updating record');
    } finally {
      setSaving(false);
    }
  };

  const excludedEditFields = ['_id', 'createdAt', 'updatedAt'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Edit Record</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">{collectionName} &bull; {record._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50/50">
          <div className="space-y-4">
            {Object.keys(record).filter(k => !excludedEditFields.includes(k)).map(key => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-700 mb-1 capitalize">
                  {key}
                </label>
                {typeof record[key] === 'boolean' ? (
                  <select 
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    value={record[key] ? 'true' : 'false'}
                    onChange={(e) => setRecord(prev => ({ ...prev, [key]: e.target.value === 'true' }))}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : typeof record[key] === 'object' && record[key] !== null ? (
                  <textarea 
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium font-mono"
                    rows={4}
                    value={JSON.stringify(record[key], null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setRecord(prev => ({ ...prev, [key]: parsed }));
                      } catch (err) {
                        // Let them type invalid JSON until they format it right, or maybe handle errors on save
                        // Alternatively just keep string value but that might break types. So simple implementation:
                        // Realistically a JSON editor is complex, let's just do a plain string for simplicity
                        setRecord(prev => ({ ...prev, [key]: e.target.value })); 
                      }
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={record[key] === null ? '' : typeof record[key] === 'object' ? JSON.stringify(record[key]) : record[key]}
                    onChange={(e) => setRecord(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [view, setView] = useState<string>('dashboard');

  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [collectionsDetails, setCollectionsDetails] = useState<any[]>([]);
  const [pinnedCollections, setPinnedCollections] = useState<string[]>(JSON.parse(localStorage.getItem('pinnedCollections') || '[]'));
  
  const [activeCollection, setActiveCollection] = useState<string>('');
  const [collectionData, setCollectionData] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{field: string | null, order: 'asc' | 'desc'}>({field: null, order: 'asc'});
  const [totalDocs, setTotalDocs] = useState<number>(0);
  
  useEffect(() => {
    setDbPage(1);
    setCustomerPage(1);
  }, [searchTerm, advancedFilters, pageSize, sortConfig]);

  // When switching collections, reset explorer page and search
  useEffect(() => {
    setDbPage(1);
    setCustomerPage(1);
    setSearchTerm('');
    setAdvancedFilters({});
    setShowFilterPanel(false);
    setSortConfig({field: null, order: 'asc'});
  }, [activeCollection, view]);

  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');
  const [assignDeviceModal, setAssignDeviceModal] = useState<{isOpen: boolean; devicesToAssign: {deviceId: string; name: string}[]} | null>(null);
  const [editRecordModal, setEditRecordModal] = useState<{isOpen: boolean; collectionName: string; record: any} | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const [collectionStats, setCollectionStats] = useState<any>({});
  const [dashboardStats, setDashboardStats] = useState<any>({ customers: 0, collections: 0 });

  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  
  const [devicePage, setDevicePage] = useState(1);
  const [deviceTotalPages, setDeviceTotalPages] = useState(1);

  const [dbPage, setDbPage] = useState(1);
  const [dbTotalPages, setDbTotalPages] = useState(1);

  // Fetch logic
  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      // Fetch core stats
      const statsResp = await fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (statsResp.status === 401) { handleLogout(); return; }
      if (statsResp.ok) {
        const stats = await statsResp.json();
        setDashboardStats(stats);
        setCollections(stats.collectionsList || []);
        setCollectionsDetails(stats.collectionsDetails || []);
        
        if (stats.collectionsDetails) {
          const statsMap: any = {};
          stats.collectionsDetails.forEach((c: any) => {
            statsMap[c.name] = c.count;
          });
          setCollectionStats(statsMap);
        }
      }

      if (view === 'dashboard') {
        const url = `/api/customers?page=${customerPage}&limit=${pageSize}&search=${searchTerm}${sortConfig.field ? `&sortField=${sortConfig.field}&sortOrder=${sortConfig.order}` : ''}`;
        const custResp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (custResp.status === 401) { handleLogout(); return; }
        if (custResp.ok) {
          const body = await custResp.json();
          setCustomers(body.data || []);
          setCustomerTotalPages(body.meta?.totalPages || 1);
          setTotalDocs(body.meta?.total || 0);
        }
      }
      
      if (view === 'devices') {
        const url = `/api/devices?page=${devicePage}&limit=${pageSize}${sortConfig.field ? `&sortField=${sortConfig.field}&sortOrder=${sortConfig.order}` : ''}`;
        const devResp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (devResp.status === 401) { handleLogout(); return; }
        if (devResp.ok) {
          const body = await devResp.json();
          setDevices(body.data || []);
          setDeviceTotalPages(body.meta?.totalPages || 1);
          setTotalDocs(body.meta?.total || 0);
        }
      }

      if (view === 'database') {
        const colResp = await fetch('/api/db/collections', { headers: { Authorization: `Bearer ${token}` } });
        if (colResp.status === 401) { handleLogout(); return; }
        if (colResp.ok) {
          const cols = await colResp.json();
          setCollections(cols);
          if (cols.length > 0 && !activeCollection) setActiveCollection(cols[0]);
        }
      }

      if (view.startsWith('table-')) {
        const colName = view.replace('table-', '');
        let url = `/api/db/collection/${colName}?page=${dbPage}&limit=${pageSize}&search=${searchTerm}${sortConfig.field ? `&sortField=${sortConfig.field}&sortOrder=${sortConfig.order}` : ''}`;
        
        // Add advanced filters if any
        const activeFilters = Object.entries(advancedFilters).filter(([_, v]) => typeof v === 'string' && v.trim() !== '');
        if (activeFilters.length > 0) {
          const queryObj: any = {};
          activeFilters.forEach(([k, v]) => {
            queryObj[k] = { $regex: v, $options: 'i' };
          });
          url += `&query=${encodeURIComponent(JSON.stringify(queryObj))}`;
        }

        const dataResp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (dataResp.status === 401) { handleLogout(); return; }
        if (dataResp.ok) {
          const body = await dataResp.json();
          setCollectionData(body.data || []);
          setDbTotalPages(body.meta?.totalPages || 1);
          setTotalDocs(body.meta?.total || 0);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeCollection && token && view === 'database') {
      let url = `/api/db/collection/${activeCollection}?page=${dbPage}&limit=${pageSize}&search=${searchTerm}${sortConfig.field ? `&sortField=${sortConfig.field}&sortOrder=${sortConfig.order}` : ''}`;
      const activeFilters = Object.entries(advancedFilters).filter(([_, v]) => typeof v === 'string' && v.trim() !== '');
      if (activeFilters.length > 0) {
        const queryObj: any = {};
        activeFilters.forEach(([k, v]) => { queryObj[k] = { $regex: v, $options: 'i' }; });
        url += `&query=${encodeURIComponent(JSON.stringify(queryObj))}`;
      }

      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(async r => {
          if (r.status === 401) { handleLogout(); return null; }
          return r.json();
        })
        .then(data => {
          if (!data) return;
          setCollectionData(data.data || []);
          setDbTotalPages(data.meta?.totalPages || 1);
          setTotalDocs(data.meta?.total || 0);
        });
    }
  }, [activeCollection, token, view, dbPage, searchTerm, advancedFilters, pageSize, sortConfig]);

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token, view, customerPage, devicePage, searchTerm, advancedFilters, pageSize, sortConfig]);

  const togglePin = (col: string) => {
    const updated = pinnedCollections.includes(col) 
      ? pinnedCollections.filter(c => c !== col) 
      : [...pinnedCollections, col];
    setPinnedCollections(updated);
    localStorage.setItem('pinnedCollections', JSON.stringify(updated));
  };

  const handleSort = (field: string) => {
    if (sortConfig.field === field) {
      if (sortConfig.order === 'asc') setSortConfig({ field, order: 'desc' });
      else setSortConfig({ field: null, order: 'asc' });
    } else {
      setSortConfig({ field, order: 'asc' });
    }
  };

  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setDbStatus)
      .catch(() => setDbStatus({ status: 'Error', mongoStatus: 'Server Unreachable' }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (resp.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setError(data.error || 'Login failed');
        if (data.details) setError(`${data.error} ${data.details}`);
      }
    } catch (e) {
      setError('Network error connecting to backend');
    }
  };

  const setupDefaultAdmin = async () => {
    await fetch('/api/auth/setup', { method: 'POST' });
    alert("Sent setup request. If no admin existed, 'admin' / 'admin123' is now available.");
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const addDevice = async () => {
    if (!newDeviceId || !newDeviceName) return;
    await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deviceId: newDeviceId, name: newDeviceName })
    });
    setNewDeviceId('');
    setNewDeviceName('');
    fetchDashboardData();
  };

  const assignDevices = async (deviceIds: string[], sifra: string) => {
    await Promise.all(deviceIds.map(deviceId => 
      fetch(`/api/devices/${deviceId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sifra })
      })
    ));
    setAssignDeviceModal(null);
    setSelectedDevices([]);
    fetchDashboardData();
  };

  const generateApiKey = async (deviceId: string) => {
    try {
      const resp = await fetch(`/api/devices/${deviceId}/apikey`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        fetchDashboardData();
      } else {
        const body = await resp.json();
        alert(body.error || 'Failed to generate API Key');
      }
    } catch(e) {
      alert('Error generating API Key');
    }
  };

  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  const deleteDevice = async (deviceId: string) => {
    try {
      const resp = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setDeviceToDelete(null);
        fetchDashboardData();
      } else {
        const body = await resp.json();
        alert(body.error || 'Failed to delete device');
      }
    } catch(e) {
      alert('Error deleting device');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-8 pt-10 pb-12">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                <SmartphoneNfc className="text-white w-10 h-10" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 text-center tracking-tight mb-2">Exebyte Admin</h2>
            <p className="text-slate-500 text-center mb-10 text-sm">Enter your credentials to manage the platform</p>
            
            {dbStatus && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 shadow-inner transition-all ${dbStatus.dbInitialized ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${dbStatus.dbInitialized ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
                <div className="flex-1">
                   <div className={`text-[10px] font-extrabold uppercase tracking-[0.1em] ${dbStatus.dbInitialized ? 'text-emerald-700' : 'text-red-700'}`}>
                     DATABASE {dbStatus.status}
                   </div>
                   {dbStatus.dbInitialized && <div className="text-[9px] text-slate-400 font-medium">Remote server authentication verified</div>}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-100/50 text-red-700 text-xs rounded-xl font-medium border border-red-200 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck size={14} className="shrink-0" />
                    <span>Access Denied</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-snug">{error}</p>
                </motion.div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Users size={16} />
                  </span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 outline-none" 
                    placeholder="admin"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <ShieldCheck size={16} />
                  </span>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 outline-none" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center group"
              >
                Sign In <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </form>
          </div>
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Exebyte Console v1.0.4</span>
            <button onClick={setupDefaultAdmin} className="text-[10px] text-indigo-400 hover:text-indigo-600 font-bold uppercase tracking-widest">Initialize Admin</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72 bg-slate-950 border-r border-slate-800">
          <div className="flex items-center h-20 px-6 bg-slate-950 border-b border-slate-900">
            <img src="https://exebyte.io/wp-content/uploads/2020/09/exeByte_final_SVG-03.svg" alt="Exebyte" className="h-8 object-contain" />
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-6 px-4 space-y-8">
            <div>
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Core Management</h3>
              <nav className="space-y-1">
                <NavItem 
                  active={view === 'dashboard'} 
                  icon={<LayoutDashboard size={20} />} 
                  label="Overview" 
                  onClick={() => setView('dashboard')} 
                />
                <NavItem 
                  active={view === 'devices'} 
                  icon={<Smartphone size={20} />} 
                  label="Fleet Devices" 
                  onClick={() => setView('devices')} 
                />
              </nav>
            </div>

            {pinnedCollections.length > 0 && (
              <div>
                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Pinned Data</h3>
                <nav className="space-y-1">
                  {pinnedCollections.map(col => (
                    <NavItem 
                      key={col}
                      active={view === `table-${col}`} 
                      icon={<Users size={20} />} 
                      label={col} 
                      onClick={() => setView(`table-${col}`)} 
                    />
                  ))}
                </nav>
              </div>
            )}

            <div>
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Engineering</h3>
              <nav className="space-y-1">
                <NavItem 
                  active={view === 'database'} 
                  icon={<Database size={20} />} 
                  label="DB Explorer" 
                  onClick={() => setView('database')} 
                />
                <NavItem 
                  active={view === 'mcp'} 
                  icon={<Play size={20} />} 
                  label="MCP Explorer" 
                  onClick={() => setView('mcp')} 
                />
                <a 
                  href="/api-docs" 
                  target="_blank" 
                  className="flex items-center px-3 py-3 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all group"
                >
                  <Share className="mr-3 w-5 h-5 text-slate-600 group-hover:text-amber-500 transition-colors" /> API Docs
                </a>
                <a 
                  href="/api-docs.json" 
                  download="swagger.json"
                  className="flex items-center px-3 py-3 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all group"
                >
                  <Download className="mr-3 w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" /> Download Swagger JSON
                </a>
              </nav>
            </div>

            <div className="mt-auto pb-8">
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                    <ShieldCheck className="text-indigo-500 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">System Status</div>
                    <div className="text-[10px] text-slate-500">All services operational</div>
                  </div>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-indigo-500 rounded-full"></div>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
              >
                <LogOut className="mr-3 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg md:hidden">
              <SmartphoneNfc className="text-indigo-600 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-950 tracking-tight capitalize flex items-center">
              {view.includes('table-') ? view.replace('table-', '') + ' Management' : view}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Universal search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-64"
                />
             </div>
             <div className="h-8 w-px bg-gray-200 mx-2"></div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:block">DEV ENVIRONMENT</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-600 border border-slate-200">EX</div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {view === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Management Console</h2>
                      <p className="text-slate-500 mt-1 font-medium">Monitoring {customers.length} active global accounts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-bold text-slate-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                          LIVE FEED ACTIVE
                       </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Total Customers" value={dashboardStats.customers} icon={<Users />} color="bg-indigo-600" />
                    <StatCard title="Managed Tables" value={dashboardStats.collections} icon={<Database />} color="bg-emerald-600" />
                    <StatCard title="System Node" value="Primary" icon={<SmartphoneNfc />} color="bg-amber-600" />
                  </div>

                  <div className="card">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-lg font-bold">Client Directory</h2>
                      <div className="flex items-center gap-4">
                        {customers.length > 0 && (
                          <Pagination 
                            currentPage={customerPage} 
                            totalPages={customerTotalPages} 
                            onPageChange={setCustomerPage}
                            compact
                          />
                        )}
                        <button 
                          onClick={() => setShowFilterPanel(!showFilterPanel)}
                          className={`text-sm font-bold flex items-center px-3 py-1.5 rounded-lg transition-all ${showFilterPanel ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:text-indigo-700'}`}
                        >
                          <Filter className="w-4 h-4 mr-2" /> Filters
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showFilterPanel && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-b border-gray-100 bg-slate-50/50"
                        >
                          <FilterPanel 
                            fields={customers.length > 0 ? Object.keys(customers[0]) : ['sifra', 'naziv', 'naslov', 'posta', 'tel', 'email']} 
                            filters={advancedFilters} 
                            onFilterChange={(f) => setAdvancedFilters(f)} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <SortHeader title="Client Code" field="sifra" currentSort={sortConfig} onSort={handleSort} />
                            <SortHeader title="Trading Name" field="naziv" currentSort={sortConfig} onSort={handleSort} />
                            <SortHeader title="Location" field="naslov" currentSort={sortConfig} onSort={handleSort} />
                            <SortHeader title="Contact" field="tel" currentSort={sortConfig} onSort={handleSort} />
                            <SortHeader title="Status" field="kupec" currentSort={sortConfig} onSort={handleSort} align="right" />
                            <th className="relative px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {customers.map((c, i) => (
                            <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">{c.sifra}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-slate-900">{c.naziv || 'N/A'}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{c.drzava || 'Region Unknown'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-slate-600 font-medium">{c.naslov || '---'}</div>
                                <div className="text-[10px] text-slate-400">{c.posta || ''}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-slate-600 truncate max-w-[150px]">{c.tel || c.email || 'No contact'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${c.kupec ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                  {c.kupec ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                  {c.kupec ? 'Active Buyer' : 'Lead'}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => setEditRecordModal({ isOpen: true, collectionName: 'customers', record: c })}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {customers.length > 0 && (
                        <Pagination 
                          currentPage={customerPage} 
                          totalPages={customerTotalPages} 
                          onPageChange={setCustomerPage} 
                          limit={pageSize}
                          onLimitChange={setPageSize}
                          totalDocs={totalDocs}
                        />
                      )}
                      {customers.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                          <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>No customer records found. Initialize data via REST API.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {view === 'database' && (
                <div className="space-y-6">
                  {/* Database Tabs */}
                  <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar shadow-sm">
                    {collections.map(col => (
                      <button 
                        key={col} 
                        onClick={() => setActiveCollection(col)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeCollection === col ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-50'}`}
                      >
                        {col}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded shadow-inner ${activeCollection === col ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {collectionStats[col] || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="card">
                    <div className="px-8 py-8 border-b border-gray-100 bg-slate-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                            Current Inspecting: {activeCollection}
                          </div>
                          <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">System Data Explorer</h2>
                            <button 
                              onClick={() => togglePin(activeCollection)}
                              className={`p-2 rounded-xl border transition-all ${pinnedCollections.includes(activeCollection) ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'}`}
                              title={pinnedCollections.includes(activeCollection) ? 'Unpin from sidebar' : 'Pin as dedicated page'}
                            >
                              <Share size={18} className={pinnedCollections.includes(activeCollection) ? 'fill-current' : ''} />
                            </button>
                          </div>
                          <p className="text-slate-500 mt-1">Direct read access to the exebyte schema.</p>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="text-right">
                              <div className="text-3xl font-mono font-light text-slate-300 tracking-tighter">{collectionStats[activeCollection] || 0}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Documents</div>
                            </div>
                            {collectionData.length > 0 && (
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showFilterPanel ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                  <Filter size={14} />
                                  Filters
                                </button>
                                <Pagination 
                                  currentPage={dbPage} 
                                  totalPages={dbTotalPages} 
                                  onPageChange={setDbPage}
                                  compact
                                  limit={pageSize}
                                  onLimitChange={setPageSize}
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showFilterPanel && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-b border-gray-100 bg-slate-50/50"
                        >
                          <FilterPanel 
                            fields={collectionData.length > 0 ? Object.keys(collectionData[0]) : []} 
                            filters={advancedFilters} 
                            onFilterChange={(f) => setAdvancedFilters(f)} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="overflow-x-auto min-h-[400px]">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100/50">
                            {collectionData.length > 0 ? (
                              Object.keys(collectionData[0]).map(key => (
                                <SortHeader key={key} title={key} field={key} currentSort={sortConfig} onSort={handleSort} />
                              ))
                            ) : (
                              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 italic">No fields detected in collection...</th>
                            )}
                            {collectionData.length > 0 && <th className="relative px-6 py-4"></th>}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {collectionData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors border-b border-gray-100 group">
                              {Object.keys(row).map((key, j) => (
                                <td key={j} className="px-6 py-4 whitespace-nowrap text-[12px] text-slate-600 font-mono max-w-[200px] truncate" title={JSON.stringify(row[key])}>
                                  {typeof row[key] === 'object' ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-indigo-50 text-indigo-400 rounded text-[9px] font-bold border border-indigo-100">
                                      OBJECT
                                    </span>
                                  ) : (
                                    String(row[key])
                                  )}
                                </td>
                              ))}
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => setEditRecordModal({ isOpen: true, collectionName: activeCollection, record: row })}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {collectionData.length > 0 && (
                      <Pagination 
                        currentPage={dbPage} 
                        totalPages={dbTotalPages} 
                        onPageChange={setDbPage} 
                      />
                    )}
                    {collectionData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                          <Database size={64} className="mb-4 opacity-10" />
                          <p className="font-bold text-xl opacity-20">NO SEED DATA FOUND</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {view === 'devices' && (
                <div className="space-y-8">
                  {/* Registry Form */}
                  <div className="card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                            <Plus className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Hardware Registry</h2>
                            <p className="text-sm text-slate-500">Add new tracking units to the global fleet.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Device ID / Serial</label>
                        <input 
                          type="text" 
                          placeholder="e.g. SN-092-B" 
                          value={newDeviceId} 
                          onChange={(e)=>setNewDeviceId(e.target.value)} 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Deployment Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Warehouse Relay" 
                          value={newDeviceName} 
                          onChange={(e)=>setNewDeviceName(e.target.value)} 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={addDevice} 
                          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                        >
                          Register Unit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 px-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Fleet Deployment</h3>
                      {selectedDevices.length > 0 && (
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                          <span className="text-xs font-bold text-indigo-700">{selectedDevices.length} selected</span>
                          <button
                            onClick={() => {
                              const selected = devices.filter(d => selectedDevices.includes(d.deviceId));
                              setAssignDeviceModal({
                                isOpen: true,
                                devicesToAssign: selected.map(d => ({deviceId: d.deviceId, name: d.name}))
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded transition-colors"
                          >
                            Assign Devices
                          </button>
                          <button
                            onClick={() => setSelectedDevices([])}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search devices..."
                          value={deviceSearchQuery}
                          onChange={(e) => setDeviceSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64"
                        />
                      </div>
                      {devices.length > 0 && (
                        <button 
                          onClick={() => {
                            const filtered = devices.filter(d => 
                              d.name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) || 
                              d.deviceId.toLowerCase().includes(deviceSearchQuery.toLowerCase())
                            );
                            if (selectedDevices.length === filtered.length) {
                              setSelectedDevices([]);
                            } else {
                              setSelectedDevices(filtered.map(d => d.deviceId));
                            }
                          }}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedDevices.length === devices.length && devices.length > 0 ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                            {selectedDevices.length > 0 && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className="hidden sm:inline">Select All</span>
                        </button>
                      )}
                      {devices.length > 0 && (
                        <Pagination 
                          currentPage={devicePage} 
                          totalPages={deviceTotalPages} 
                          onPageChange={setDevicePage}
                          compact
                          limit={pageSize}
                          onLimitChange={setPageSize}
                        />
                      )}
                    </div>
                  </div>

                  {/* Device List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {devices.filter(d => 
                      d.name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) || 
                      d.deviceId.toLowerCase().includes(deviceSearchQuery.toLowerCase())
                    ).map((d, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={d.deviceId} 
                        className={`card relative p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer border-2 transition-all ${selectedDevices.includes(d.deviceId) ? 'border-indigo-500 bg-indigo-50/10' : 'border-transparent hover:border-indigo-100'}`}
                        onClick={() => {
                          setSelectedDevices(prev => 
                            prev.includes(d.deviceId) ? prev.filter(id => id !== d.deviceId) : [...prev, d.deviceId]
                          );
                        }}
                      >
                         <div className="absolute top-4 right-4">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedDevices.includes(d.deviceId) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 bg-white'}`}>
                              {selectedDevices.includes(d.deviceId) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                         </div>
                         <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                            <Smartphone className="text-white w-8 h-8" />
                         </div>
                         <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-lg font-extrabold text-slate-950">{d.name}</h4>
                            <p className="text-xs font-mono text-indigo-600 mb-2">{d.deviceId}</p>
                            
                            {d.apiKey && (
                              <div className="mb-3 px-3 py-2 bg-slate-900 rounded-lg flex items-center justify-between group">
                                <code className="text-[10px] text-indigo-300 font-mono break-all">{d.apiKey}</code>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(d.apiKey);
                                  }}
                                  className="text-slate-400 hover:text-white transition-colors ml-2"
                                  title="Copy API Key"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                               <div className="flex items-center text-xs text-slate-400">
                                  <Clock size={12} className="mr-1.5" /> {new Date(d.createdAt).toLocaleDateString()}
                               </div>
                               {d.assignedTo ? (
                                  <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                     <CheckCircle2 size={12} className="mr-1" /> Assigned: {d.assignedTo}
                                  </div>
                               ) : (
                                  <div className="flex items-center text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded italic">
                                     Unassigned
                                  </div>
                               )}
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                               <button 
                                 onClick={(e) => {
                                  e.stopPropagation();
                                  setAssignDeviceModal({ isOpen: true, devicesToAssign: [{deviceId: d.deviceId, name: d.name}] })
                                 }} 
                                 className="px-3 py-1.5 bg-slate-950 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-600 transition-colors shrink-0"
                               >
                                 Assign / Reassign Device
                               </button>
                               <button
                                 onClick={(e) => {
                                  e.stopPropagation();
                                  generateApiKey(d.deviceId);
                                 }}
                                 className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition-colors shrink-0 whitespace-nowrap"
                               >
                                 {d.apiKey ? 'Reset Key' : 'Generate Key'}
                               </button>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setDeviceToDelete(d.deviceId);
                                 }}
                                 className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                                 title="Delete Device"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                  {devices.length > 0 && (
                    <Pagination 
                      currentPage={devicePage} 
                      totalPages={deviceTotalPages} 
                      onPageChange={setDevicePage} 
                      limit={pageSize}
                      onLimitChange={setPageSize}
                      totalDocs={totalDocs}
                    />
                  )}
                </div>
              )}

              {view === 'mcp' && <McpExplorer token={token} />}

              {view.startsWith('table-') && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2 border border-indigo-100">
                        RELATIONAL DATA VIEW
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
                        {view.replace('table-', '')}
                        <span className="text-slate-300 font-light">|</span>
                        <span className="text-base font-medium text-slate-500">Dataset Management</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => togglePin(view.replace('table-', ''))}
                         className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors border border-slate-100"
                         title="Unpin this page"
                       >
                         <ShieldCheck size={20} />
                       </button>
                       <div className="text-right px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="text-2xl font-mono font-bold text-slate-900 leading-none">
                            {collectionData.length > 0 ? (dbTotalPages * 10) : 0}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Approx. Records</div>
                       </div>
                    </div>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/30">
                       <div className="flex items-center gap-4">
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                              type="text" 
                              placeholder={`Filter ${view.replace('table-', '')}...`}
                              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs w-64 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                         </div>
                         <button 
                           onClick={() => setShowFilterPanel(!showFilterPanel)}
                           className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${showFilterPanel ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'}`}
                         >
                           <Filter size={14} />
                           Advanced Filters
                         </button>
                       </div>
                       <Pagination 
                        currentPage={dbPage} 
                        totalPages={dbTotalPages} 
                        onPageChange={setDbPage}
                        compact
                        limit={pageSize}
                        onLimitChange={setPageSize}
                       />
                    </div>

                    <AnimatePresence>
                      {showFilterPanel && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-b border-gray-100 bg-slate-50/50"
                        >
                          <FilterPanel 
                            fields={collectionData.length > 0 ? Object.keys(collectionData[0]) : []} 
                            filters={advancedFilters} 
                            onFilterChange={(f) => setAdvancedFilters(f)} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="overflow-x-auto min-h-[500px]">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            {collectionData.length > 0 ? (
                              Object.keys(collectionData[0]).map(key => (
                                <SortHeader key={key} title={key} field={key} currentSort={sortConfig} onSort={handleSort} />
                              ))
                            ) : (
                              <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 italic">No structure available...</th>
                            )}
                            {collectionData.length > 0 && <th className="relative px-6 py-4"></th>}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {collectionData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors border-b border-gray-100 group">
                              {Object.keys(row).map((key, j) => (
                                <td key={j} className="px-8 py-4 whitespace-nowrap text-[12px] text-slate-600 font-mono max-w-[250px] truncate group-hover:text-indigo-600 transition-colors">
                                  {typeof row[key] === 'object' ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-indigo-50 text-indigo-400 rounded text-[9px] font-bold border border-indigo-100">
                                      OBJECT
                                    </span>
                                  ) : (
                                    String(row[key])
                                  )}
                                </td>
                              ))}
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => setEditRecordModal({ isOpen: true, collectionName: view.replace('table-', ''), record: row })}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination 
                      currentPage={dbPage} 
                      totalPages={dbTotalPages} 
                      onPageChange={setDbPage} 
                      limit={pageSize}
                      onLimitChange={setPageSize}
                      totalDocs={totalDocs}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <AssignDeviceModal 
            isOpen={assignDeviceModal?.isOpen || false} 
            devicesToAssign={assignDeviceModal?.devicesToAssign || []} 
            token={token} 
            onClose={() => setAssignDeviceModal(null)} 
            onAssign={assignDevices} 
          />
          <EditRecordModal
            isOpen={editRecordModal?.isOpen || false}
            collectionName={editRecordModal?.collectionName || ''}
            initialRecord={editRecordModal?.record || {}}
            token={token}
            onClose={() => setEditRecordModal(null)}
            onSave={fetchDashboardData}
          />
          
          {deviceToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Device</h3>
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete this device? This action cannot be undone.
                  </p>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                  <button 
                    onClick={() => setDeviceToDelete(null)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors w-full"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => deleteDevice(deviceToDelete)}
                    className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors w-full"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Sub-components
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  compact = false,
  limit,
  onLimitChange,
  totalDocs
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (p: number) => void, 
  compact?: boolean,
  limit?: number,
  onLimitChange?: (l: number) => void,
  totalDocs?: number
}) {
  if (totalPages <= 1 && (!totalDocs || totalDocs <= (limit || 10))) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      
      // Always show last
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between flex-wrap gap-4 ${compact ? 'py-1' : 'px-6 py-4 bg-white border-t border-gray-100'}`}>
      <div className="flex items-center gap-4">
        {!compact && (
          <div className="text-xs text-slate-500 font-medium tracking-tight flex items-center">
            Page <span className="text-slate-900 font-bold mx-1">{currentPage}</span> of <span className="text-slate-900 font-bold mx-1">{totalPages}</span>
          </div>
        )}
        {(totalDocs !== undefined) && (
          <div className="text-xs text-slate-500 font-medium tracking-tight whitespace-nowrap">
            <span className="text-slate-900 font-bold">{totalDocs}</span> total records
          </div>
        )}
        {(limit !== undefined && onLimitChange !== undefined) && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">Show:</label>
            <select 
              value={limit} 
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="text-xs font-bold text-slate-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all text-slate-600"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map((num, i) => (
          num === '...' ? (
            <span key={`sep-${i}`} className="px-2 text-slate-300 font-bold text-xs">...</span>
          ) : (
            <button
              key={`page-${num}`}
              onClick={() => onPageChange(num as number)}
              className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-[10px] md:text-xs font-bold transition-all ${currentPage === num ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-indigo-50 border border-transparent'}`}
            >
              {num}
            </button>
          )
        ))}

        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all text-slate-600"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function FilterPanel({ fields, filters, onFilterChange }: { fields: string[], filters: Record<string, string>, onFilterChange: (f: Record<string, string>) => void }) {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fields.slice(0, 12).map(field => (
          <div key={field} className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{field}</label>
            <input 
              type="text" 
              placeholder={`Filter ${field}...`}
              value={filters[field] || ''}
              onChange={(e) => onFilterChange({ ...filters, [field]: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        ))}
      </div>
      {fields.length > 12 && (
        <p className="mt-4 text-[10px] text-slate-400 italic font-medium">* Only showing first 12 fields for quick filtering. Use search for deep queries.</p>
      )}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => onFilterChange({})}
          className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

function SortHeader({ title, field, currentSort, onSort, align = 'left' }: { 
  title: string, 
  field: string, 
  currentSort: {field: string | null, order: 'asc'|'desc'}, 
  onSort: (f: string) => void,
  align?: 'left' | 'right',
  key?: React.Key
}) {
  const isActive = currentSort.field === field;
  return (
    <th 
      className={`px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {title}
        <span className={`text-[10px] ${isActive ? 'text-indigo-600 font-black' : 'text-slate-300'}`}>
          {isActive ? (currentSort.order === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </th>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, key?: React.Key }) {
  return (
    <button 
      onClick={onClick} 
      className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-xl w-full transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10' 
          : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
      }`}
    >
      <span className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-indigo-400'} transition-colors duration-200`}>
        {icon}
      </span>
      <span className="ml-3 tracking-tight">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="ml-auto flex items-center"
        >
          <ChevronRight size={14} className="text-white/50" />
        </motion.div>
      )}
    </button>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="card p-6 flex items-center gap-6">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/5`}>
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h4>
        <div className="text-3xl font-extrabold text-slate-950 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

