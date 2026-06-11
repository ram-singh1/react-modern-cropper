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
          <div className="space-y-6 animate-fadeIn">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-3 text-brand-300 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Coordinate Math &amp; Architecture
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                When scaling, rotating, and shifting an image inside a cropping viewport, translating screen drag events back into natural pixel boundaries requires calculating transform matrices relative to the viewport container center.
              </p>

              <div className="bg-neutral-950 border border-white/10 rounded-xl p-4 flex items-center justify-center shadow-inner mb-6">
                <img
                  src="/cropper-sketch.png"
                  alt="Viewport Math Coordinate diagram"
                  className="max-h-[420px] object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="space-y-4 text-neutral-400 text-xs leading-relaxed">
                <h3 className="text-white font-semibold">Transform Matrix Flow</h3>
                <p>
                  To convert panning offsets, zoom levels, and rotations into a final image slice:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Translation Step:</strong> Translate the canvas rendering origin to the center of the crop viewport area. This aligns the rotation pivots correctly.</li>
                  <li><strong>Rotation Step:</strong> Rotate the canvas rendering viewport by the rotation angle.</li>
                  <li><strong>Scaling Step:</strong> Scale the canvas grid according to the calculated zoom factor.</li>
                  <li><strong>Export Render:</strong> Draw the source image with the calculated scale/offset values, then clip and fetch the PNG data using <code>canvas.toDataURL()</code>.</li>
                </ul>
              </div>
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
