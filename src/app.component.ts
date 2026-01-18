
import { Component, ElementRef, ViewChild, signal, computed, effect, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from './services/translation.service';
import { GeminiService } from './services/gemini.service';

interface SealConfig {
  topText: string;
  bottomText: string;
  centerText: string;
  shape: 'circle' | 'square' | 'oval';
  color: string;
  borderWidth: number;
  fontFamily: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="min-h-screen flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
  <!-- Header -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold serif border-2 border-red-800">
          S
        </div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">{{ t().title }}</h1>
      </div>
      
      <div class="flex items-center gap-2">
        @for (lang of languages; track lang.code) {
          <button 
            (click)="setLang(lang.code)"
            [class]="'px-2 py-1 text-xs font-medium rounded transition-colors ' + 
                     (currentLang() === lang.code ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'text-slate-500 hover:bg-slate-50')">
            {{ lang.label }}
          </button>
        }
      </div>
    </div>
  </header>

  <main class="flex-grow bg-slate-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Controls Section -->
        <div class="lg:col-span-5 space-y-6">
          <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>
              {{ t().settings }}
            </h2>

            <!-- AI Generator -->
             <div class="mb-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <label class="block text-xs font-semibold text-indigo-900 mb-2 uppercase tracking-wide">{{ t().aiSuggest }}</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  [placeholder]="t().aiPromptPlaceholder"
                  [value]="aiPrompt()"
                  (input)="updateAiPrompt($event)"
                  (keydown.enter)="generateAiContent()"
                  class="flex-1 bg-white border border-indigo-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 shadow-sm"
                >
                <button 
                  (click)="generateAiContent()"
                  [disabled]="isGenerating()"
                  class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
                  @if (isGenerating()) {
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" /></svg>
                  }
                  {{ isGenerating() ? t().generating : 'AI' }}
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Texts -->
              <div>
                <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().topText }}</label>
                <input type="text" [value]="config().topText" (input)="updateConfig('topText', $event)" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().centerText }}</label>
                <input type="text" [value]="config().centerText" (input)="updateConfig('centerText', $event)" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().bottomText }}</label>
                <input type="text" [value]="config().bottomText" (input)="updateConfig('bottomText', $event)" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
              </div>

              <hr class="border-slate-100 my-4">

              <!-- Visuals -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().shape }}</label>
                  <select [value]="config().shape" (change)="updateConfig('shape', $event)" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                    <option value="circle">{{ t().circle }}</option>
                    <option value="square">{{ t().square }}</option>
                    <option value="oval">{{ t().oval }}</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().color }}</label>
                   <select [value]="config().color" (change)="updateConfig('color', $event)" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                    <option value="#dc2626">{{ t().red }}</option>
                    <option value="#2563eb">{{ t().blue }}</option>
                    <option value="#16a34a">{{ t().green }}</option>
                    <option value="#000000">{{ t().black }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                 <div>
                  <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().font }}</label>
                  <select [value]="config().fontFamily" (change)="updateConfig('fontFamily', $event)" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                    <option value="Noto Serif">{{ t().serif }}</option>
                    <option value="Noto Sans">{{ t().sans }}</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-1 text-sm font-medium text-slate-700">{{ t().borderWidth }}</label>
                  <input type="range" min="2" max="20" [value]="config().borderWidth" (input)="updateConfig('borderWidth', $event)" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600">
                </div>
              </div>
              
            </div>
          </section>
        </div>

        <!-- Preview Section -->
        <div class="lg:col-span-7">
          <section class="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col items-center justify-center sticky top-24">
             <h2 class="w-full text-left text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
              {{ t().preview }}
            </h2>
            
            <div class="relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-white p-8 rounded-xl border border-slate-100 shadow-inner mb-6">
              <canvas #sealCanvas width="400" height="400" class="max-w-full h-auto cursor-crosshair shadow-sm rounded-full"></canvas>
            </div>

            <button 
              (click)="download()"
              class="w-full sm:w-auto text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-bold rounded-lg text-lg px-8 py-3 focus:outline-none transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ t().download }}
            </button>
          </section>
        </div>

      </div>

      <!-- SEO Content -->
      <article class="mt-16 bg-white rounded-2xl p-8 border border-slate-200">
        <h2 class="text-2xl font-bold text-slate-800 mb-4">{{ t().descriptionTitle }}</h2>
        <p class="text-slate-600 leading-relaxed mb-4">{{ t().seoText }}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
           <div class="p-4 bg-red-50 rounded-lg border border-red-100">
             <h3 class="font-bold text-red-900 mb-2">No Registration</h3>
             <p class="text-sm text-red-800">Start creating immediately. We respect your privacy and don't require any sign-ups.</p>
           </div>
           <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
             <h3 class="font-bold text-blue-900 mb-2">High Resolution</h3>
             <p class="text-sm text-blue-800">Export crystal clear PNGs suitable for official documents, invoices, or art.</p>
           </div>
           <div class="p-4 bg-green-50 rounded-lg border border-green-100">
             <h3 class="font-bold text-green-900 mb-2">Multi-Language</h3>
             <p class="text-sm text-green-800">Full support for various languages and character sets including English, Chinese, and Spanish.</p>
           </div>
        </div>
      </article>

    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
    <p>&copy; 2024 Global Seal Maker AI. Free Online Tool.</p>
  </footer>
</div>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild('sealCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private translationService = inject(TranslationService);
  private geminiService = inject(GeminiService);

  // State
  config = signal<SealConfig>({
    topText: 'OFFICIAL SEAL',
    bottomText: 'EST. 2024',
    centerText: '★',
    shape: 'circle',
    color: '#dc2626',
    borderWidth: 8,
    fontFamily: 'Noto Serif'
  });

  aiPrompt = signal('');
  isGenerating = signal(false);

  // Computed
  t = this.translationService.t;
  currentLang = this.translationService.currentLang;
  languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'zh', label: '中文' },
  ];

  constructor() {
    // Redraw whenever config changes
    effect(() => {
      this.drawSeal(this.config());
    });
  }

  ngAfterViewInit() {
    this.drawSeal(this.config());
  }

  setLang(lang: Language) {
    this.translationService.setLanguage(lang);
  }

  updateConfig(key: keyof SealConfig, event: Event) {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.config.update(c => ({ ...c, [key]: value }));
  }

  updateAiPrompt(event: Event) {
    this.aiPrompt.set((event.target as HTMLInputElement).value);
  }

  async generateAiContent() {
    if (!this.aiPrompt() || this.isGenerating()) return;

    this.isGenerating.set(true);
    const result = await this.geminiService.suggestSealContent(this.aiPrompt(), this.currentLang());
    
    this.config.update(c => ({
      ...c,
      topText: result.topText || c.topText,
      bottomText: result.bottomText || c.bottomText,
      centerText: result.centerText || c.centerText
    }));
    this.isGenerating.set(false);
  }

  download() {
    const canvas = this.canvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = `seal-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // --- Canvas Drawing Logic ---
  private drawSeal(config: SealConfig) {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Draw Border
    ctx.lineWidth = Number(config.borderWidth);
    
    ctx.beginPath();
    if (config.shape === 'circle') {
      const radius = (Math.min(width, height) / 2) - 10;
      ctx.arc(centerX, centerY, radius - (ctx.lineWidth/2), 0, Math.PI * 2);
      
      // Inner thin line
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(centerX, centerY, radius - Number(config.borderWidth) - 4, 0, Math.PI * 2);
      ctx.stroke();

    } else if (config.shape === 'square') {
      const size = Math.min(width, height) - 20;
      ctx.strokeRect(10 + (ctx.lineWidth/2), 10 + (ctx.lineWidth/2), size - ctx.lineWidth, size - ctx.lineWidth);
      
      // Inner thin line
      ctx.lineWidth = 2;
      const inset = Number(config.borderWidth) + 4;
      ctx.strokeRect(10 + inset, 10 + inset, size - (inset*2), size - (inset*2));

    } else if (config.shape === 'oval') {
       const rx = (width / 2) - 10;
       const ry = (height / 2) * 0.7;
       ctx.ellipse(centerX, centerY, rx - (ctx.lineWidth/2), ry - (ctx.lineWidth/2), 0, 0, Math.PI * 2);
       ctx.stroke();
       
       ctx.beginPath();
       ctx.lineWidth = 2;
       ctx.ellipse(centerX, centerY, rx - Number(config.borderWidth) - 4, ry - Number(config.borderWidth) - 4, 0, 0, Math.PI * 2);
       ctx.stroke();
    }

    // 2. Draw Center Text
    ctx.font = `bold ${config.shape === 'square' ? '80px' : '70px'} ${config.fontFamily}`;
    ctx.fillText(config.centerText, centerX, centerY);

    // 3. Draw Top/Bottom Text
    // Logic differs for Square vs Circle/Oval
    if (config.shape === 'square') {
       // Linear layout for square
       ctx.font = `bold 32px ${config.fontFamily}`;
       ctx.fillText(config.topText, centerX, 60);
       ctx.fillText(config.bottomText, centerX, height - 60);
    } else {
       // Curved text for circle/oval
       this.drawCurvedText(ctx, config.topText, centerX, centerY, 140, true, config.fontFamily);
       this.drawCurvedText(ctx, config.bottomText, centerX, centerY, 140, false, config.fontFamily);
    }
  }

  private drawCurvedText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, isTop: boolean, font: string) {
    if (!text) return;
    
    ctx.font = `bold 32px ${font}`;
    // Increase spacing slightly
    const anglePerChar = 0.25; 
    const totalAngle = anglePerChar * (text.length - 1);
    
    // Start angle: -PI/2 is top (12 o'clock). 
    // If top text, we center around -PI/2.
    // If bottom text, we center around PI/2.
    let startAngle = isTop 
      ? -Math.PI / 2 - (totalAngle / 2) 
      : Math.PI / 2 - (totalAngle / 2);

    ctx.save();
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const angle = startAngle + (i * anglePerChar);
      
      ctx.save();
      ctx.translate(
        cx + Math.cos(angle) * radius, 
        cy + Math.sin(angle) * radius
      );
      
      // Rotate text. 
      // Top: standard rotation + 90deg.
      // Bottom: standard + 90deg - 180deg (to flip it right side up relative to path)
      const rotation = angle + Math.PI / 2 + (isTop ? 0 : Math.PI);
      ctx.rotate(rotation);
      
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
}
