import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Plus, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  Info,
  ToggleLeft,
  ToggleRight,
  Clock
} from 'lucide-react';
import { AIModelRegistry, AIModelConfig } from '../../types';
import { saveAIModelRegistry } from '../../services/adminService';

interface AdminAIModelsProps {
  registry: AIModelRegistry;
  currentUserEmail: string;
}

export const AdminAIModels: React.FC<AdminAIModelsProps> = ({
  registry,
  currentUserEmail
}) => {
  const [currentRegistry, setCurrentRegistry] = useState<AIModelRegistry>(registry);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New model form state
  const [newModel, setNewModel] = useState<Partial<AIModelConfig>>({
    id: '',
    name: '',
    provider: 'Google DeepMind',
    enabled: true,
    isDefault: false,
    priority: currentRegistry.models.length + 1,
    intendedUse: '',
    qualityNotes: ''
  });

  const handleToggleModel = async (modelId: string) => {
    const updatedModels = currentRegistry.models.map(m => {
      if (m.id === modelId) {
        // Prevent disabling the default active model
        if (m.isDefault && m.enabled) {
          throw new Error("Cannot disable the default active model. Please select another default model first.");
        }
        return { ...m, enabled: !m.enabled };
      }
      return m;
    });

    const newReg = {
      ...currentRegistry,
      models: updatedModels
    };

    await saveRegistryChanges(newReg, `Updated status for model ${modelId}.`);
  };

  const handleSetDefault = async (modelId: string) => {
    const targetModel = currentRegistry.models.find(m => m.id === modelId);
    if (!targetModel) return;
    if (!targetModel.enabled) {
      setStatusMessage({ type: 'error', text: "Cannot set a disabled model as default. Enable it first." });
      return;
    }

    const updatedModels = currentRegistry.models.map(m => ({
      ...m,
      isDefault: m.id === modelId
    }));

    const newReg = {
      ...currentRegistry,
      defaultModel: modelId,
      models: updatedModels
    };

    await saveRegistryChanges(newReg, `Set ${targetModel.name} (${modelId}) as primary default generation model.`);
  };

  const handlePriorityChange = async (modelId: string, newPriority: number) => {
    const updatedModels = currentRegistry.models.map(m => 
      m.id === modelId ? { ...m, priority: newPriority } : m
    );

    const newReg = {
      ...currentRegistry,
      models: updatedModels
    };

    await saveRegistryChanges(newReg, `Updated priority for model ${modelId}.`);
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.id || !newModel.name) {
      setStatusMessage({ type: 'error', text: "Model ID and Name are required." });
      return;
    }

    if (currentRegistry.models.some(m => m.id === newModel.id)) {
      setStatusMessage({ type: 'error', text: `Model with ID '${newModel.id}' already exists in registry.` });
      return;
    }

    const modelToAdd: AIModelConfig = {
      id: newModel.id.trim(),
      name: newModel.name.trim(),
      provider: newModel.provider || 'Google DeepMind',
      enabled: newModel.enabled ?? true,
      isDefault: false,
      priority: Number(newModel.priority) || currentRegistry.models.length + 1,
      intendedUse: newModel.intendedUse || 'General paper generation',
      qualityNotes: newModel.qualityNotes || 'Configured via Admin Center',
      dateAdded: Date.now()
    };

    const newReg = {
      ...currentRegistry,
      models: [...currentRegistry.models, modelToAdd]
    };

    await saveRegistryChanges(newReg, `Added new model '${modelToAdd.name}' (${modelToAdd.id}) to registry.`);
    setShowAddModal(false);
    setNewModel({
      id: '',
      name: '',
      provider: 'Google DeepMind',
      enabled: true,
      isDefault: false,
      priority: newReg.models.length + 1,
      intendedUse: '',
      qualityNotes: ''
    });
  };

  const saveRegistryChanges = async (newReg: AIModelRegistry, successNotice: string) => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveAIModelRegistry(newReg, currentUserEmail);
      setCurrentRegistry(newReg);
      setStatusMessage({ type: 'success', text: successNotice });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || "Failed to save AI Model registry." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6" id="admin-ai-models-container">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-500" />
            AI & Generation Model Registry
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure available Gemini models, set primary generation engines, and manage fallback priorities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Supported Model
        </button>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Gradual Model Improvement Architectural Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/20 text-gray-800 dark:text-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Gradual Model Routing & Quality Strategy
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Zero Private Data Training
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              GenPaperAI selects enabled models according to your priority strategy. Quality improves over time by monitoring generation response latency, blueprint compliance, and error fallback telemetry — never by training models on private student or teacher examination content.
            </p>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentRegistry.models
          .sort((a, b) => a.priority - b.priority)
          .map((model) => {
            const isDefault = model.id === currentRegistry.defaultModel;

            return (
              <div 
                key={model.id}
                className={`p-5 rounded-2xl border transition-all relative ${
                  isDefault
                    ? 'bg-purple-500/5 dark:bg-purple-950/20 border-purple-500/40 shadow-sm'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase tracking-wider shadow-xs">
                          <Star className="w-3 h-3 fill-current" /> Primary Default
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-gray-500">{model.id}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleModel(model.id)}
                      disabled={isSaving}
                      title={model.enabled ? "Disable model" : "Enable model"}
                      className="cursor-pointer"
                    >
                      {model.enabled ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400" /> Disabled
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-semibold text-gray-400">Intended Purpose:</span> {model.intendedUse}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400">Quality Notes:</span> {model.qualityNotes}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-semibold">Priority:</span>
                    <select
                      value={model.priority}
                      onChange={(e) => handlePriorityChange(model.id, Number(e.target.value))}
                      disabled={isSaving}
                      className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? '(Highest)' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {!isDefault && model.enabled && (
                    <button
                      onClick={() => handleSetDefault(model.id)}
                      disabled={isSaving}
                      className="px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Make Default Model →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-500" />
                Register Supported AI Model
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddModel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Model Identifier (API Model ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gemini-2.5-pro or gemini-2.5-flash"
                  value={newModel.id}
                  onChange={(e) => setNewModel({ ...newModel, id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gemini 2.5 Pro High Reasoning"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Provider
                  </label>
                  <select
                    value={newModel.provider}
                    onChange={(e) => setNewModel({ ...newModel, provider: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                  >
                    <option value="Google DeepMind">Google DeepMind</option>
                    <option value="Gemini">Gemini</option>
                    <option value="Custom">Custom Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Priority Order (1-8)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newModel.priority}
                    onChange={(e) => setNewModel({ ...newModel, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Intended Use Case
                </label>
                <input
                  type="text"
                  placeholder="e.g. HOTS Reasoning, High-Throughput Fallback, etc."
                  value={newModel.intendedUse}
                  onChange={(e) => setNewModel({ ...newModel, intendedUse: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Performance & Quality Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Adherence to Bloom taxonomy, token efficiency notes..."
                  value={newModel.qualityNotes}
                  onChange={(e) => setNewModel({ ...newModel, qualityNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer"
                >
                  {isSaving ? 'Registering...' : 'Add to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
