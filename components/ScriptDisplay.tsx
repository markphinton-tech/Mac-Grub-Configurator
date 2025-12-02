import React, { useState } from 'react';
import { Button } from './Button';
import { Copy, Check, Download, Terminal, AlertTriangle, Info, ShieldAlert, HelpCircle, HardDrive } from 'lucide-react';

interface ScriptDisplayProps {
  script: string;
  explanation: string;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, explanation }) => {
  const [copied, setCopied] = useState(false);
  const [fixCopied, setFixCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFixCopy = () => {
    navigator.clipboard.writeText('chmod +x ~/Downloads/create_fix_usb*.command');
    setFixCopied(true);
    setTimeout(() => setFixCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // .command extension allows double-clicking on macOS
    a.download = 'create_fix_usb.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg flex items-start">
        <AlertTriangle className="text-yellow-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-200/90">
          <p className="font-bold text-yellow-100 mb-1">Warning: Disk Erasure</p>
          <p>The generated script will Format and Erase the target USB drive. Ensure you have selected the correct disk and backed up any existing data.</p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg flex items-start">
        <DiscIcon className="text-blue-400 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-200/90">
          <p className="font-bold text-blue-100 mb-1">Prerequisite: Ubuntu Live USB</p>
          <p>You need <strong>TWO</strong> USB drives to perform this fix:</p>
          <ul className="list-disc list-inside mt-1 ml-1 space-y-1 text-blue-300">
             <li><strong>USB 1 (Installer):</strong> The USB you use to boot the Mac into "Try Ubuntu".</li>
             <li><strong>USB 2 (Rescue):</strong> This new USB we are creating now, which holds the fix script.</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2 text-gray-300">
            <Terminal size={18} />
            <span className="text-sm font-mono">create_fix_usb.command</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs py-1 px-2 h-8">
              {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload} className="text-xs py-1 px-2 h-8">
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </div>
        </div>
        <div className="relative group">
          <pre className="p-4 overflow-x-auto text-sm font-mono text-green-400 bg-black/50 leading-relaxed">
            <code>{script}</code>
          </pre>
        </div>
        <div className="bg-blue-900/20 p-3 border-t border-gray-700 flex items-start gap-2">
           <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
           <p className="text-xs text-blue-200">
             <strong>Tip:</strong> The downloaded file ends in <code>.command</code>. Double-click it, and it will ask for your Mac password to proceed.
           </p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Instructions</h3>
        <div className="prose prose-invert text-gray-300 text-sm max-w-none mb-6">
           <p className="whitespace-pre-line leading-relaxed">{explanation}</p>
        </div>
        
        {/* Permission Fix Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4">
             <div className="flex items-start mb-3">
                <ShieldAlert className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-100 font-bold text-sm">Mac Errors & Fixes</h4>
                  <p className="text-xs text-red-200/80 mt-1">
                    Permission issues? Run this command:
                  </p>
                </div>
             </div>

             <div className="bg-black/40 rounded p-2 mb-2 border border-gray-700/50 flex flex-col gap-2">
                <code className="text-green-400 text-xs font-mono break-all">
                  chmod +x ~/Downloads/create_fix_usb*.command
                </code>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleFixCopy} 
                  className="text-xs h-7 w-full bg-gray-700 hover:bg-gray-600"
                >
                  {fixCopied ? <Check size={12} className="mr-1"/> : <Copy size={12} className="mr-1"/>}
                  Copy Fix Command
                </Button>
             </div>
             <p className="text-xs text-red-200/60 mt-2 border-t border-red-500/30 pt-2">
               <strong>Disk Error?</strong> If it says "NOT an external drive" but you are sure it is your USB, type <code>force</code> when prompted by the script to bypass the check.
             </p>
          </div>

          <div className="bg-gray-700/30 border border-gray-600/30 rounded-md p-4">
             <div className="flex items-start mb-3">
                <HelpCircle className="w-5 h-5 text-ubuntu-orange mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-gray-100 font-bold text-sm">Linux: Can't see the drive?</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    If the USB doesn't appear in Ubuntu, try these commands:
                  </p>
                </div>
             </div>
             <div className="space-y-2">
                <div className="bg-black/40 rounded p-2 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">List all drives and labels:</p>
                    <code className="text-green-400 text-xs font-mono block">lsblk -o NAME,LABEL,SIZE,MOUNTPOINT</code>
                </div>
                <div className="bg-black/40 rounded p-2 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Force find the script:</p>
                    <code className="text-green-400 text-xs font-mono block">find / -name repair_boot.sh 2>/dev/null</code>
                </div>
                <div className="bg-black/40 rounded p-2 border border-gray-700/50 mt-2">
                    <p className="text-xs text-red-300 mb-1"><strong>"Command not found"?</strong> Use this:</p>
                    <code className="text-green-400 text-xs font-mono block">sudo bash repair_boot.sh</code>
                </div>
             </div>
          </div>
        </div>

        {/* Critical Error Troubleshooting */}
        <div className="mt-6 bg-red-950/40 border border-red-500/50 rounded-md p-4">
            <div className="flex items-start">
                <HardDrive className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-red-100 font-bold text-sm">Troubleshooting: "Input/output error"</h4>
                    <p className="text-xs text-red-200/90 mt-2 leading-relaxed">
                        If you see <code>/usr/sbin/chroot: Input/output error</code> when running the script on Linux:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-xs text-red-200/80 space-y-1">
                        <li><strong>Your Ubuntu Live USB is likely failing.</strong> This error usually means the computer lost connection to the USB stick you booted from.</li>
                        <li>Try plugging the Live USB into a different port.</li>
                        <li>If the error persists, you may need to create a fresh Ubuntu Installer USB.</li>
                        <li>It can also indicate corruption on the internal hard drive. Run <code>fsck -y /dev/sda2</code> (replace with your partition) to check.</li>
                    </ul>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// Simple icon component for internal use
const DiscIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);