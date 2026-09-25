import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Smartphone,
  Globe,
  Code2,
  Terminal,
  Zap,
  Activity
} from 'lucide-react';
import api from '../api/client';

export default function OTPVerification() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'sandbox' | 'apikeys' | 'docs'
  const [stats, setStats] = useState({
    total_sent: 0,
    total_verified: 0,
    success_rate_percent: 100,
    avg_delivery_seconds: 1.2
  });

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  // Sandbox state
  const [testPhone, setTestPhone] = useState('918248651695');
  const [testAppName, setTestAppName] = useState('Unavukadai Food');
  const [testPurpose, setTestPurpose] = useState('LOGIN');
  const [testLength, setTestLength] = useState(4);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/otp/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load OTP stats:', err);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchPhone) params.search = searchPhone;
      const res = await api.get('/otp/logs', { params });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load OTP logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await api.get('/otp/keys');
      setApiKeys(res.data || []);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();
    fetchKeys();

    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [filterStatus, searchPhone]);

  const handleSendTestOtp = async (e) => {
    e.preventDefault();
    if (!testPhone) return;
    setIsSendingOtp(true);
    setSendResult(null);
    setVerifyResult(null);

    try {
      const res = await api.post('/otp/send', {
        phone: testPhone,
        app_name: testAppName,
        purpose: testPurpose,
        code_length: Number(testLength),
        expiry_minutes: 5
      });
      setSendResult({ success: true, data: res.data });
      fetchStats();
      fetchLogs();
    } catch (err) {
      setSendResult({
        success: false,
        error: err.response?.data?.detail || err.message
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyTestOtp = async (e) => {
    e.preventDefault();
    if (!verifyCode) return;
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await api.post('/otp/verify', {
        phone: testPhone,
        otp: verifyCode
      });
      setVerifyResult(res.data);
      fetchStats();
      fetchLogs();
    } catch (err) {
      setVerifyResult({
        success: false,
        error: err.response?.data?.detail || err.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const res = await api.post('/otp/keys', { name: newKeyName.trim() });
      setGeneratedKey(res.data);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      alert('Error creating API key: ' + err.message);
    }
  };

  const handleDeleteApiKey = async (id) => {
    if (!confirm('Are you sure you want to revoke this API Key?')) return;
    try {
      await api.delete(`/otp/keys/${id}`);
      fetchKeys();
    } catch (err) {
      alert('Error deleting API key: ' + err.message);
    }
  };

  const copyToClipboard = (text, identifier) => {
    navigator.clipboard.writeText(text);
    if (identifier === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSnippet(identifier);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  const curlSendSnippet = `curl -X POST http://localhost:8000/api/v1/otp/send \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKeys[0]?.key_prefix || 'wa_live_your_api_key'}" \\
  -d '{
    "phone": "919840123456",
    "app_name": "Unavukadai Food",
    "code_length": 4,
    "purpose": "LOGIN"
  }'`;

  const curlVerifySnippet = `curl -X POST http://localhost:8000/api/v1/otp/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "919840123456",
    "otp": "4819"
  }'`;

  const jsFetchSnippet = `// 1. Send WhatsApp OTP
const sendRes = await fetch("http://localhost:8000/api/v1/otp/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: userPhone,
    app_name: "Unavukadai",
    code_length: 4
  })
});
const sendData = await sendRes.json();

// 2. Verify WhatsApp OTP
const verifyRes = await fetch("http://localhost:8000/api/v1/otp/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: userPhone,
    otp: userEnteredCode
  })
});
const { success, verified } = await verifyRes.json();
if (verified) {
  console.log("Customer logged in via WhatsApp!");
}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              WhatsApp OTP Verification Gateway
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Production API
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Verify user logins and orders on external platforms (like <strong className="text-emerald-300 font-semibold">Unavukadai Food</strong>) with free, instant WhatsApp OTPs directly through your linked device.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Logs
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Test Sandbox
          </button>
          <button
            onClick={() => setActiveTab('apikeys')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'apikeys'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            SDK & Docs
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between mb-1">
            <span>Total OTPs Dispatched</span>
            <Send className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.total_sent}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between mb-1">
            <span>Verified Successfully</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.total_verified}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between mb-1">
            <span>Success Rate</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.success_rate_percent}%</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between mb-1">
            <span>Avg Delivery Speed</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">~1.2s</div>
        </div>
      </div>

      {/* TAB 1: LIVE FEED & AUDIT LOGS */}
      {activeTab === 'feed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Live OTP Dispatch Audit Trail</h3>
              <p className="text-xs text-slate-400">Shows incoming requests from external websites and verification states.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="FAILED">Failed</option>
              </select>

              <button
                onClick={fetchLogs}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Target WhatsApp</th>
                  <th className="px-4 py-3">App / Source</th>
                  <th className="px-4 py-3">Code Preview</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Dispatched At</th>
                  <th className="px-4 py-3">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No OTP requests recorded yet. Use the Test Sandbox tab to send a live test!
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            log.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : log.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : log.status === 'EXPIRED'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {log.status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {log.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                          {log.status === 'FAILED' && <XCircle className="w-3 h-3 text-red-400" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">+{log.phone_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                          {log.app_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-bold tracking-widest">
                        {log.preview}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{log.attempts} / 3</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {log.whatsapp_delivered ? (
                          <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Delivered
                          </span>
                        ) : (
                          <span className="text-red-400 text-[11px]" title={log.error_message}>
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEST SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Send OTP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Send Real WhatsApp OTP</h3>
                <p className="text-[11px] text-slate-400">Triggers an instant message via your linked WhatsApp.</p>
              </div>
            </div>

            <form onSubmit={handleSendTestOtp} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">WhatsApp Mobile Number</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="e.g. 919840123456"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">App Name</label>
                  <input
                    type="text"
                    value={testAppName}
                    onChange={(e) => setTestAppName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Code Length</label>
                  <select
                    value={testLength}
                    onChange={(e) => setTestLength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value={4}>4-Digit (Unavukadai)</option>
                    <option value={6}>6-Digit (Standard)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending to WhatsApp...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Live OTP
                  </>
                )}
              </button>

              {sendResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    sendResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/30 text-red-300'
                  }`}
                >
                  {sendResult.success ? (
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> OTP Dispatched to WhatsApp!
                      </p>
                      <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">
                        Expires in 5 minutes. Check WhatsApp on +{sendResult.data.phone}.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Send Failed
                      </p>
                      <p className="text-[11px] text-red-300/80 mt-1">{sendResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Step 2: Verify OTP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Verify Entered OTP</h3>
                <p className="text-[11px] text-slate-400">Simulates user typing the received code on your website.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyTestOtp} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Phone Number</label>
                <input
                  type="text"
                  value={testPhone}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Enter Received Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={testLength === 4 ? 'e.g. 4819' : 'e.g. 582910'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !verifyCode}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating Code...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify OTP
                  </>
                )}
              </button>

              {verifyResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    verifyResult.verified
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/30 text-red-300'
                  }`}
                >
                  {verifyResult.verified ? (
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Verification Successful!
                      </p>
                      <p className="text-[11px] text-emerald-400/80 mt-1">
                        User phone +{verifyResult.phone} verified at {new Date(verifyResult.verified_at).toLocaleTimeString()}.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Verification Failed
                      </p>
                      <p className="text-[11px] text-red-300/80 mt-1">{verifyResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: API KEYS */}
      {activeTab === 'apikeys' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white">External App API Keys</h3>
            <p className="text-xs text-slate-400">Generate secure API keys for external websites like Unavukadai to communicate with this verification gateway.</p>
          </div>

          <form onSubmit={handleCreateApiKey} className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="e.g. Unavukadai Production"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" /> Generate Key
            </button>
          </form>

          {generatedKey && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>⚠️ Copy your API Key now (it won't be shown again in full):</span>
                <button
                  onClick={() => copyToClipboard(generatedKey.key, 'key')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 text-[11px]"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied!' : 'Copy Key'}
                </button>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 select-all border border-emerald-500/20">
                {generatedKey.key}
              </div>
            </div>
          )}

          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Client App Name</th>
                  <th className="px-4 py-3">Key Prefix</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No API keys generated yet. Create one above!
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-white">{k.name}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{k.key_prefix}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {k.created_at ? new Date(k.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteApiKey(k.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                          title="Revoke key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SDK & DOCS */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  cURL Command Examples
                </h3>
                <p className="text-xs text-slate-400">Test directly from any terminal or server environment.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>1. Send OTP Request:</span>
                <button
                  onClick={() => copyToClipboard(curlSendSnippet, 'curl-send')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedSnippet === 'curl-send' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'curl-send' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
                {curlSendSnippet}
              </pre>

              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between pt-2">
                <span>2. Verify OTP Request:</span>
                <button
                  onClick={() => copyToClipboard(curlVerifySnippet, 'curl-verify')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedSnippet === 'curl-verify' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'curl-verify' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-blue-300 overflow-x-auto border border-slate-800">
                {curlVerifySnippet}
              </pre>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  JavaScript / Fetch Integration (React, Next.js, Node.js)
                </h3>
                <p className="text-xs text-slate-400">Drop-in code for Unavukadai or any web front-end.</p>
              </div>
              <button
                onClick={() => copyToClipboard(jsFetchSnippet, 'js-fetch')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              >
                {copiedSnippet === 'js-fetch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet === 'js-fetch' ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
              {jsFetchSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
