import React, { useState } from 'react';
import { generateRescueScript } from './services/geminiService';
import { ScriptConfig, GeneratedScript } from './types';
import { Button } from './components/Button';
import { ScriptDisplay } from './components/ScriptDisplay';
import { Disc, Cpu, Terminal, AlertTriangle, ArrowRight, Settings, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<ScriptConfig>({
    diskIdentifier: 'disk4',
    linuxDistro: 'Ubuntu',
    issueDescription: 'Graphics issues during login on old MacBook Pro (suspected Grub/GPU driver issue).',
    targetArchitecture: 'x86_64',
    includeOptimizations: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedScript(null);

    try {
      // Trim identifier to prevent errors
      const safeConfig = { ...config, diskIdentifier: config.diskIdentifier.trim() };
      const result = await generateRescueScript(safeConfig);
      setGeneratedScript(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#2c2c2c] border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-ubuntu-orange p-2 rounded-md">
              <Terminal className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Grub<span className="text-ubuntu-orange">Rescue</span> Gen
            </h1>
          </div>
          <div className="text-xs text-gray-400 font-mono hidden sm:block">
            v1.1.0 | Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#252525] rounded-xl p-6 border border-gray-800 shadow-lg">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-ubuntu-orange" />
                Configuration
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Issue Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Issue Description
                  </label>
                  <textarea
                    name="issueDescription"
                    value={config.issueDescription}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md p-3 text-sm text-white focus:ring-2 focus:ring-ubuntu-orange focus:border-transparent outline-none h-24 resize-none"
                    placeholder="Describe the boot issue..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about symptoms (e.g., black screen, blinking cursor).
                  </p>
                </div>

                {/* Disk Identifier */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Target USB Identifier (macOS)
                  </label>
                  <div className="relative">
                    <Disc className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      name="diskIdentifier"
                      value={config.diskIdentifier}
                      onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md pl-10 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-ubuntu-orange focus:border-transparent outline-none font-mono"
                      placeholder="disk4"
                    />
                  </div>
                  <p className="text-xs text-yellow-600/80 mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Verify with 'diskutil list' before running.
                  </p>
                </div>

                {/* Distro Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      OS / Distro
                    </label>
                    <select
                      name="linuxDistro"
                      value={config.linuxDistro}
                      onChange={handleInputChange}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-ubuntu-orange focus:border-transparent outline-none appearance-none"
                    >
                      <option>Ubuntu</option>
                      <option>Debian</option>
                      <option>Fedora</option>
                      <option>Linux Mint</option>
                      <option>Arch Linux</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Architecture
                    </label>
                    <div className="relative">
                       <Cpu className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                       <input
                        type="text"
                        name="targetArchitecture"
                        value={config.targetArchitecture}
                        readOnly
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md pl-10 pr-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Optimization Checkbox */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <label className="flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="includeOptimizations"
                        checked={config.includeOptimizations}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-ubuntu-orange border-gray-600 rounded focus:ring-ubuntu-orange bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="font-medium text-gray-200 flex items-center">
                        <Zap className="w-3.5 h-3.5 text-yellow-400 mr-1.5" />
                        Performance Optimizations
                      </span>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Tweak system swappiness & cache pressure to speed up older Macs.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    isLoading={loading}
                    icon={<ArrowRight size={18} />}
                  >
                    {loading ? 'Generating Strategy...' : 'Generate Rescue Script'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                <h4 className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">How this works</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                    This tool uses Google Gemini to write a custom bash script. 
                    Run the generated script on your macOS machine to prepare a USB stick. 
                    Then, boot your Ubuntu Installer USB, plug in this Rescue stick, and run the script inside to fix the internal drive.
                </p>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-lg mb-6 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Generation Failed</h3>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!generatedScript && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl min-h-[400px]">
                <Terminal className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">Configure settings and generate your script</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-ubuntu-orange min-h-[400px]">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-ubuntu-orange rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium animate-pulse">Consulting Gemini...</p>
                <p className="text-xs text-gray-500 mt-2">Analyzing GRUB & System config</p>
              </div>
            )}

            {generatedScript && (
              <ScriptDisplay 
                script={generatedScript.content}
                explanation={generatedScript.explanation}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;