import { useState } from 'react'
import { Sparkles, Play, Rocket, BookOpen, Layers, Copy, Check } from 'lucide-react'
import { Cropper } from '@/components/cropper/Cropper'
import { BulkCompressor } from '@/components/cropper/BulkCompressor'
import { useCropStore } from '@/store/cropStore'
import type { CropResult } from '@/types'

const SAMPLE =
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80'

export default function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'start' | 'api' | 'math'>('demo')
  const [demoSubTab, setDemoSubTab] = useState<'single' | 'bulk'>('single')
  const [lastCrop, setLastCrop] = useState<CropResult | null>(null)
  const [src, setSrc] = useState<string | undefined>(undefined)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const clearImage = useCropStore((s) => s.clearImage)

  const clearEditor = () => {
    setSrc(undefined)
    setLastCrop(null)
    clearImage()
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row overflow-x-hidden">
      {/* Background Aurora Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] animate-aurora rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute -right-32 top-20 h-[30rem] w-[30rem] animate-aurora-slow rounded-full bg-accent-500/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] animate-aurora rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,10,12,0.7))]" />
      </div>

      {/* Navigation Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-neutral-900/40 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between backdrop-blur-xl z-20">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              R
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white leading-none">Modern Cropper</h2>
              <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider mt-1 block">Playground & Docs</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Play className="w-4 h-4" /> Interactive Playground
            </button>
            <button
              onClick={() => setActiveTab('start')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'start'
                  ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Rocket className="w-4 h-4" /> Getting Started
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'api'
                  ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" /> API Reference
            </button>
            <button
              onClick={() => setActiveTab('math')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'math'
                  ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" /> Architecture Math
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
          <div className="text-[10px] text-neutral-500 font-mono">
            react-modern-image-cropper
            <div className="text-[9px] text-neutral-600 mt-1">Package Demo App</div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow p-6 md:p-10 max-w-5xl mx-auto w-full z-10 flex flex-col gap-7">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
              <Sparkles className="h-3 w-3 text-brand-300" />
              AI-powered · open source · TypeScript
            </div>
            <h1 className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
              react-modern-image-cropper
            </h1>
            <p className="mt-1.5 text-xs text-white/50 max-w-lg">
              A premium React image cropper featuring AI auto-crop, custom aspect presets, adjustments, and smooth gestures.
            </p>
          </div>
          
          {activeTab === 'demo' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSrc(SAMPLE)}
                className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                Load Sample Image
              </button>
              <button
                type="button"
                onClick={clearEditor}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/10"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* TAB content rendering */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            {/* Demo Sub-Tabs */}
            <div className="flex border-b border-white/10 pb-1">
              <div className="flex gap-4">
                <button
                  onClick={() => setDemoSubTab('single')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition ${
                    demoSubTab === 'single'
                      ? 'border-brand-500 text-brand-300'
                      : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
                >
                  Single Image Editor
                </button>
                <button
                  onClick={() => setDemoSubTab('bulk')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition ${
                    demoSubTab === 'bulk'
                      ? 'border-brand-500 text-brand-300'
                      : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
                >
                  Bulk Compressor
                </button>
              </div>
            </div>

            {demoSubTab === 'single' ? (
              <div className="space-y-6">
                <Cropper src={src} defaultTheme="dark" onCrop={(r) => setLastCrop(r)} />

                {lastCrop && (
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <p className="mb-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Export Output • {lastCrop.width}×{lastCrop.height}px •{' '}
                      {(lastCrop.blob.size / 1024).toFixed(0)} KB
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <img
                        src={lastCrop.dataUrl}
                        alt="Cropped Result"
                        className="max-h-48 rounded-xl ring-1 ring-white/10 shadow-lg object-contain bg-neutral-900"
                      />
                      <div className="flex flex-col gap-2">
                        <a
                          href={lastCrop.dataUrl}
                          download="cropped-image.png"
                          className="px-4 py-2 bg-brand-gradient text-white font-semibold text-xs rounded-xl shadow hover:brightness-115 transition inline-flex items-center gap-1.5 justify-center"
                        >
                          Download Crop Result
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <BulkCompressor />
            )}
          </div>
        )}

        {activeTab === 'start' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-3 text-brand-300 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-400" /> Getting Started
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Install <code>react-modern-image-cropper</code> and its peer dependencies. It is completely touch-optimized, supports high-DPI outputs, and comes out of the box with AI auto-cropping capability using vision models.
              </p>

              <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider mb-3">1. Install Package</h3>
              <div className="relative mb-4">
                <pre className="bg-neutral-900 border border-white/5 rounded-xl p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                  npm install react-modern-image-cropper
                </pre>
                <button
                  onClick={() => copyToClipboard('npm install react-modern-image-cropper', 'install-npm')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-neutral-400 hover:text-white"
                >
                  {copiedId === 'install-npm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-neutral-900 border border-white/5 rounded-xl p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                  yarn add react-modern-image-cropper
                </pre>
                <button
                  onClick={() => copyToClipboard('yarn add react-modern-image-cropper', 'install-yarn')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-neutral-400 hover:text-white"
                >
                  {copiedId === 'install-yarn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-3 text-white/90">2. Basic Usage</h2>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Import the main <code>Cropper</code> component and CSS styling in your app code:
              </p>

              <div className="relative">
                <pre className="bg-neutral-900 border border-white/5 rounded-xl p-4 text-[10px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`import React, { useState } from 'react';
import { Cropper } from 'react-modern-image-cropper';
import 'react-modern-image-cropper/styles.css';

export default function MyEditor() {
  const [result, setResult] = useState(null);

  const handleCrop = (cropResult) => {
    // cropResult contains: dataUrl, blob, width, height, coordinates
    setResult(cropResult);
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Cropper
        src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
        aspectRatio={1}
        onCrop={handleCrop}
      />
    </div>
  );
}`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`import React, { useState } from 'react';\nimport { Cropper } from 'react-modern-image-cropper';\nimport 'react-modern-image-cropper/styles.css';\n\nexport default function MyEditor() {\n  const [result, setResult] = useState(null);\n\n  const handleCrop = (cropResult) => {\n    setResult(cropResult);\n  };\n\n  return (\n    <div style={{ width: '100%', height: '400px' }}>\n      <Cropper\n        src=\"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e\"\n        aspectRatio={1}\n        onCrop={handleCrop}\n      />\n    </div>\n  );\n}`, 'code-usage')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-neutral-400 hover:text-white"
                >
                  {copiedId === 'code-usage' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="glass rounded-2xl p-6 border border-white/10 overflow-hidden animate-fadeIn">
            <h2 className="text-lg font-bold mb-3 text-brand-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> API Property Reference
            </h2>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Customize the editor layout, dimensions, default behavior, and hooks using the following standard props:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-neutral-300 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Prop</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Default</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-400">
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-300 font-medium">src</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">string</td>
                    <td className="px-4 py-3 font-mono text-amber-500">undefined</td>
                    <td className="px-4 py-3">The source URL, base64, or local blob path of the image to crop.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-300 font-medium">aspectRatio</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">number</td>
                    <td className="px-4 py-3 font-mono text-amber-500">1</td>
                    <td className="px-4 py-3">Initial bounding ratio of crop box (width / height). Set to free by toggling lock off.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-300 font-medium">defaultTheme</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">'light' | 'dark'</td>
                    <td className="px-4 py-3 font-mono text-amber-500">'dark'</td>
                    <td className="px-4 py-3">Initial visual styling setup for controls and slider containers.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-brand-300 font-medium">onCrop</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">function</td>
                    <td className="px-4 py-3 font-mono text-amber-500">undefined</td>
                    <td className="px-4 py-3">Callback hook <code>{"(result: CropResult) => void"}</code> fired upon crop generation.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'math' && (
          <div className="space-y-6 animate-fadeIn pb-12">
            {/* Header Card */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-300 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" /> Coordinate Math &amp; Architecture
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Learn how react-modern-image-cropper handles lossless viewport transforms, coordinate spaces, and frame-accurate video rendering.
                  </p>
                </div>
                <a
                  href="file:///var/www/html/react-modern-image-cropper/docs/ARCHITECTURE_MATH.md"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition text-xs text-indigo-300"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read Math Docs
                </a>
              </div>

              {/* Math Intro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-brand-300 text-xs font-semibold mb-1">1. Source Space</div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    The raw image or video pixel boundaries. Range: [0, naturalWidth] × [0, naturalHeight]. Lossless adjustments and presets are drawn directly on this grid.
                  </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-cyan-400 text-xs font-semibold mb-1">2. Transformed Stage</div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Canvas rendering boundaries. Origin translated to center pivot for rotation and zoom. Flipped with negative scaling values.
                  </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="text-emerald-400 text-xs font-semibold mb-1">3. Viewport Space</div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Normalized crop box relative to the stage. Dimensions: x, y, width, height &in; [0.0, 1.0]. Resolution independent.
                  </p>
                </div>
              </div>
            </div>

            {/* Diagram 1: Coordinate Spaces & Bounding Boxes */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-2">1. Coordinate Spaces &amp; Bounding Boxes</h3>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                The viewport crop rectangle represents normalized relative offsets on the transformed canvas. Resizing is constrained when the aspect ratio is locked.
              </p>
              <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 flex items-center justify-center shadow-inner mb-4">
                <svg viewBox="0 0 400 240" className="w-full max-w-lg mx-auto bg-neutral-900/50 border border-white/5 rounded-lg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <rect x="20" y="20" width="360" height="200" rx="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="25" y="35" className="fill-neutral-400 text-[9px] font-mono">Viewport Stage Bounds (stageW x stageH)</text>

                  <circle cx="200" cy="120" r="3" fill="#6366f1" />
                  <circle cx="200" cy="120" r="8" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="210" y="123" className="fill-indigo-400 text-[8px] font-mono">Center Pivot (stageW/2, stageH/2)</text>

                  <g transform="translate(200, 120) rotate(12) scale(0.9)">
                    <rect x="-120" y="-75" width="240" height="150" rx="4" fill="rgba(6, 182, 212, 0.03)" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" />
                    <text x="-112" y="-58" className="fill-cyan-400 text-[8px] font-mono">Rotated/Scaled Image</text>
                  </g>

                  <rect x="100" y="60" width="180" height="110" rx="4" fill="rgba(99, 102, 241, 0.08)" stroke="#6366f1" strokeWidth="1.5" />
                  <line x1="160" y1="60" x2="160" y2="170" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="220" y1="60" x2="220" y2="170" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="100" y1="96" x2="280" y2="96" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="100" y1="133" x2="280" y2="133" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="2 2" />

                  <rect x="98" y="58" width="4" height="4" fill="#fff" stroke="#6366f1" strokeWidth="1" />
                  <rect x="278" y="58" width="4" height="4" fill="#fff" stroke="#6366f1" strokeWidth="1" />
                  <rect x="98" y="168" width="4" height="4" fill="#fff" stroke="#6366f1" strokeWidth="1" />
                  <rect x="278" y="168" width="4" height="4" fill="#fff" stroke="#6366f1" strokeWidth="1" />

                  <text x="106" y="52" className="fill-brand-300 text-[8px] font-mono">Crop Origin (crop.x, crop.y)</text>
                  <text x="130" y="181" className="fill-brand-300 text-[8px] font-mono">Size: crop.width x crop.height [0.0 to 1.0]</text>
                </svg>
              </div>
            </div>

            {/* Diagram 2: Affine Transformation Matrix Pipeline */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-2">2. Affine Transformation Pipeline</h3>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Applying transformations centered around the center point pivot requires composing a sequence of translation, rotation, and scaling matrices.
              </p>
              <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 flex items-center justify-center shadow-inner mb-4">
                <svg viewBox="0 0 540 130" className="w-full max-w-2xl mx-auto bg-neutral-900/50 border border-white/5 rounded-lg">
                  <g transform="translate(10, 15)">
                    <rect x="0" y="10" width="80" height="60" rx="4" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <text x="40" y="45" textAnchor="middle" className="fill-neutral-400 text-[9px] font-mono">Raw Image</text>
                    <text x="40" y="82" textAnchor="middle" className="fill-neutral-500 text-[7px] font-mono">At (0,0)</text>
                  </g>

                  <path d="M 105 45 L 125 45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text x="115" y="38" textAnchor="middle" className="fill-indigo-400 text-[7px] font-mono">T(W/2, H/2)</text>

                  <g transform="translate(140, 15)">
                    <rect x="0" y="10" width="80" height="60" rx="4" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
                    <path d="M 40 30 L 40 50 M 30 40 L 50 40" stroke="#6366f1" strokeWidth="0.8" />
                    <text x="40" y="82" textAnchor="middle" className="fill-indigo-300 text-[7px] font-mono">1. Shift to Center</text>
                  </g>

                  <path d="M 235 45 L 255 45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text x="245" y="38" textAnchor="middle" className="fill-cyan-400 text-[7px] font-mono">Rotate(&theta;)</text>

                  <g transform="translate(270, 15)">
                    <rect x="0" y="10" width="80" height="60" rx="4" fill="rgba(6, 182, 212, 0.03)" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" transform="rotate(12 40 40)" />
                    <path d="M 40 30 L 40 50 M 30 40 L 50 40" stroke="#06b6d4" strokeWidth="0.8" />
                    <text x="40" y="82" textAnchor="middle" className="fill-cyan-300 text-[7px] font-mono">2. Rotate Grid</text>
                  </g>

                  <path d="M 365 45 L 385 45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <text x="375" y="38" textAnchor="middle" className="fill-emerald-400 text-[7px] font-mono">Scale(zoom)</text>

                  <g transform="translate(400, 15)">
                    <rect x="12" y="19" width="56" height="42" rx="4" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" transform="rotate(12 40 40)" />
                    <circle cx="40" cy="40" r="1.5" fill="#10b981" />
                    <text x="40" y="82" textAnchor="middle" className="fill-emerald-300 text-[7px] font-mono">3. Draw Image</text>
                  </g>
                </svg>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 text-[11px] text-neutral-400 space-y-2">
                <div className="font-semibold text-white">Transform Matrix Formula:</div>
                <div className="font-mono text-indigo-300 overflow-x-auto whitespace-nowrap bg-neutral-950/50 p-2.5 rounded-lg border border-white/5">
                  M = T(stageW / 2, stageH / 2) &times; R(&theta;) &times; S(zoom &times; flipH, zoom &times; flipV) &times; T(-naturalWidth / 2, -naturalHeight / 2)
                </div>
                <p>
                  To prevent rotation clipping, the source image coordinates are translated back by negative half-dimensions <code>(-naturalW/2, -naturalH/2)</code> after translation, rotation, and scaling are set on the canvas viewport.
                </p>
              </div>
            </div>

            {/* Diagram 3: Video Recording Seeking Pipeline */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-2">3. Frame-by-Frame Video Crop Architecture</h3>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Rather than playing the video in real-time, which drops frames when performance fluctuates and can trigger browser crashes, exports use programmatic, seeked-event frame stepping.
              </p>
              <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 flex items-center justify-center shadow-inner mb-4">
                <svg viewBox="0 0 460 115" className="w-full max-w-xl mx-auto bg-neutral-900/50 border border-white/5 rounded-lg">
                  <g transform="translate(15, 10)">
                    <rect x="0" y="10" width="80" height="42" rx="4" fill="rgba(239, 68, 68, 0.03)" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" />
                    <text x="40" y="28" textAnchor="middle" className="fill-red-400 text-[8px] font-bold font-mono">PAUSE PLAYBACK</text>
                    <text x="40" y="40" textAnchor="middle" className="fill-neutral-400 text-[7px] font-mono">Freeze video</text>
                  </g>

                  <path d="M 100 31 L 120 31" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                  <g transform="translate(125, 10)">
                    <rect x="0" y="10" width="80" height="42" rx="4" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
                    <text x="40" y="28" textAnchor="middle" className="fill-indigo-400 text-[8px] font-bold font-mono">SEEK TO TIME</text>
                    <text x="40" y="40" textAnchor="middle" className="fill-neutral-400 text-[7px] font-mono">Set currentTime</text>
                  </g>

                  <path d="M 210 31 L 230 31" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                  <g transform="translate(235, 10)">
                    <rect x="0" y="10" width="90" height="42" rx="4" fill="rgba(245, 158, 11, 0.03)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
                    <text x="45" y="28" textAnchor="middle" className="fill-amber-400 text-[8px] font-bold font-mono">WAIT 'SEEKED'</text>
                    <text x="45" y="40" textAnchor="middle" className="fill-neutral-400 text-[7px] font-mono">Wait decode</text>
                  </g>

                  <path d="M 330 31 L 350 31" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                  <g transform="translate(355, 10)">
                    <rect x="0" y="10" width="90" height="42" rx="4" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <text x="45" y="28" textAnchor="middle" className="fill-emerald-400 text-[8px] font-bold font-mono">DRAW &amp; RECORD</text>
                    <text x="45" y="40" textAnchor="middle" className="fill-neutral-400 text-[7px] font-mono">Record canvas</text>
                  </g>

                  <path d="M 400 55 L 400 70 L 165 70 L 165 55" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="282" y="80" textAnchor="middle" className="fill-indigo-300 text-[8px] font-mono">Loop for all frames (30 FPS)</text>
                </svg>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                By rendering frame-by-frame and pausing real-time playback, the cropper guarantees that every single video frame is rendered exactly once, preventing audio playing overhead, eliminating frame duplication, and ensuring the browser never exhausts its execution buffers (preventing "Aw, snap!" errors).
              </p>
            </div>
          </div>
        )}

        <p className="pb-4 text-center text-[10px] text-white/30 font-mono">
          Built with React · Zustand · Framer Motion · MediaPipe
        </p>
      </main>
    </div>
  )
}
