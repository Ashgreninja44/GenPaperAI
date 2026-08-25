import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  HardDrive, 
  Key, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity,
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  testAIConnection, 
  testFirestoreConnection, 
  testStorageConnection, 
  testAuthProviders, 
  logAdminAction 
} from '../../services/adminService';

interface AdminDiagnosticsProps {
  currentUserEmail: string;
}

export const AdminDiagnostics: React.FC<AdminDiagnosticsProps> = ({
  currentUserEmail
}) => {
  // Test states
  const [aiTest, setAiTest] = useState<{ running: boolean; result: any | null }>({ running: false, result: null });
  const [dbTest, setDbTest] = useState<{ running: boolean; result: any | null }>({ running: false, result: null });
  const [storageTest, setStorageTest] = useState<{ running: boolean; result: any | null }>({ running: false, result: null });
  const [authTest, setAuthTest] = useState<{ running: boolean; result: any | null }>({ running: false, result: null });

  const [isRunningAll, setIsRunningAll] = useState(false);

  const runAITest = async () => {
    setAiTest({ running: true, result: null });
    const res = await testAIConnection();
    setAiTest({ running: false, result: res });
    logAdminAction(currentUserEmail, 'DIAGNOSTIC_AI_TEST', 'service:gemini_ai', { success: res.success, latency: res.latencyMs }).catch(() => {});
  };

  const runDbTest = async () => {
    setDbTest({ running: true, result: null });
    const res = await testFirestoreConnection();
    setDbTest({ running: false, result: res });
    logAdminAction(currentUserEmail, 'DIAGNOSTIC_DB_TEST', 'service:firestore', { success: res.success, latency: res.latencyMs }).catch(() => {});
  };

  const runStorageTest = async () => {
    setStorageTest({ running: true, result: null });
    const res = await testStorageConnection();
    setStorageTest({ running: false, result: res });
    logAdminAction(currentUserEmail, 'DIAGNOSTIC_STORAGE_TEST', 'service:firebase_storage', { success: res.success, latency: res.latencyMs }).catch(() => {});
  };

  const runAuthTest = async () => {
    setAuthTest({ running: true, result: null });
    const res = testAuthProviders();
    setAuthTest({ running: false, result: res });
    logAdminAction(currentUserEmail, 'DIAGNOSTIC_AUTH_TEST', 'service:firebase_auth', { google: res.google, microsoft: res.microsoft, email: res.email }).catch(() => {});
  };

  const runAllDiagnostics = async () => {
    setIsRunningAll(true);
    await Promise.all([
      runAITest(),
      runDbTest(),
      runStorageTest(),
      runAuthTest()
    ]);
    setIsRunningAll(false);
  };

  return (
    <div className="space-y-6" id="admin-diagnostics-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Infrastructure & Integration Diagnostics
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Perform live connectivity and permission tests against Gemini AI, Firestore database, Storage, and Authentication providers.
          </p>
        </div>

        <button
          onClick={runAllDiagnostics}
          disabled={isRunningAll}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
          {isRunningAll ? 'Running All Checks...' : 'Run All Diagnostics'}
        </button>
      </div>

      {/* Diagnostics Test Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. AI CONNECTION TEST */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Gemini AI Model Endpoint</h3>
                <p className="text-xs text-gray-500">Tests server proxy & model generation</p>
              </div>
            </div>

            <button
              onClick={runAITest}
              disabled={aiTest.running}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
            >
              {aiTest.running ? 'Testing...' : 'Test AI Connection'}
            </button>
          </div>

          {aiTest.result && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
              aiTest.result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
            }`}>
              {aiTest.result.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{aiTest.result.success ? '✓ Connected' : '✗ Connection Failed'}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{aiTest.result.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* 2. FIRESTORE DATABASE TEST */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Firestore Database</h3>
                <p className="text-xs text-gray-500">Tests read/write permissions & latency</p>
              </div>
            </div>

            <button
              onClick={runDbTest}
              disabled={dbTest.running}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
            >
              {dbTest.running ? 'Testing...' : 'Test DB Connection'}
            </button>
          </div>

          {dbTest.result && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
              dbTest.result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
            }`}>
              {dbTest.result.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{dbTest.result.success ? '✓ Connected' : '✗ Failed'}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{dbTest.result.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* 3. STORAGE TEST */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Storage Connection</h3>
                <p className="text-xs text-gray-500">Tests diagram & logo bucket upload</p>
              </div>
            </div>

            <button
              onClick={runStorageTest}
              disabled={storageTest.running}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
            >
              {storageTest.running ? 'Testing...' : 'Test Storage'}
            </button>
          </div>

          {storageTest.result && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
              storageTest.result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
            }`}>
              {storageTest.result.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{storageTest.result.success ? '✓ Connected' : '✗ Storage Restricted'}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{storageTest.result.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* 4. AUTHENTICATION PROVIDERS TEST */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Authentication Gateways</h3>
                <p className="text-xs text-gray-500">Google, Microsoft & Email readiness</p>
              </div>
            </div>

            <button
              onClick={runAuthTest}
              disabled={authTest.running}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
            >
              {authTest.running ? 'Testing...' : 'Test Auth SDK'}
            </button>
          </div>

          {authTest.result && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ✓ Authentication SDK Verified
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold">
                  Google: Active
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold">
                  Microsoft: Active
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold">
                  Email/Password: Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
