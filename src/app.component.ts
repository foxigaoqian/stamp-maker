
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
  templateUrl: './app.component.html'
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
