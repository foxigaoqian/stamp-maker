
import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'es' | 'zh' | 'fr';

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    title: 'Free Online Seal Maker',
    subtitle: 'Create professional digital stamps in seconds.',
    topText: 'Top Text',
    bottomText: 'Bottom Text',
    centerText: 'Center Text',
    shape: 'Shape',
    color: 'Color',
    borderWidth: 'Border Width',
    download: 'Download Seal',
    aiSuggest: 'AI Suggest Content',
    aiPromptPlaceholder: 'e.g., Coffee Shop, Law Firm...',
    generating: 'Generating...',
    circle: 'Circle',
    square: 'Square',
    oval: 'Oval',
    red: 'Red',
    blue: 'Blue',
    black: 'Black',
    green: 'Green',
    preview: 'Preview',
    settings: 'Settings',
    descriptionTitle: 'About this Tool',
    seoText: 'This free online seal maker allows you to create custom digital stamps and seals without registration. Ideal for businesses, official documents, or creative projects. Features include multi-language support, high-resolution PNG export, and AI-powered text suggestions to help you design the perfect seal.',
    font: 'Font Style',
    serif: 'Serif',
    sans: 'Sans-Serif'
  },
  es: {
    title: 'Creador de Sellos Online Gratis',
    subtitle: 'Crea sellos digitales profesionales en segundos.',
    topText: 'Texto Superior',
    bottomText: 'Texto Inferior',
    centerText: 'Texto Central',
    shape: 'Forma',
    color: 'Color',
    borderWidth: 'Grosor del Borde',
    download: 'Descargar Sello',
    aiSuggest: 'Sugerencia IA',
    aiPromptPlaceholder: 'ej., Cafetería, Bufete...',
    generating: 'Generando...',
    circle: 'Círculo',
    square: 'Cuadrado',
    oval: 'Óvalo',
    red: 'Rojo',
    blue: 'Azul',
    black: 'Negro',
    green: 'Verde',
    preview: 'Vista Previa',
    settings: 'Ajustes',
    descriptionTitle: 'Sobre esta herramienta',
    seoText: 'Este creador de sellos en línea gratuito le permite crear sellos y timbres digitales personalizados sin registro. Ideal para empresas, documentos oficiales o proyectos creativos. Incluye soporte en varios idiomas, exportación PNG de alta resolución y sugerencias de texto impulsadas por IA.',
    font: 'Estilo de Fuente',
    serif: 'Serifa',
    sans: 'Sans-Serif'
  },
  zh: {
    title: '免费在线印章制作工具',
    subtitle: '几秒钟内创建专业的电子印章。',
    topText: '顶部文字',
    bottomText: '底部文字',
    centerText: '中心文字',
    shape: '形状',
    color: '颜色',
    borderWidth: '边框宽度',
    download: '下载印章',
    aiSuggest: 'AI 智能建议',
    aiPromptPlaceholder: '例如：咖啡店、律师事务所...',
    generating: '生成中...',
    circle: '圆形',
    square: '方形',
    oval: '椭圆',
    red: '红色',
    blue: '蓝色',
    black: '黑色',
    green: '绿色',
    preview: '预览',
    settings: '设置',
    descriptionTitle: '关于本工具',
    seoText: '这款免费的在线印章制作工具让您无需注册即可创建自定义电子印章。非常适合企业、官方文件或创意项目。功能包括多语言支持、高分辨率 PNG 导出以及 AI 驱动的文本建议，帮助您设计完美的印章。',
    font: '字体风格',
    serif: '衬线体',
    sans: '无衬线体'
  },
  fr: {
    title: 'Créateur de Sceau en Ligne Gratuit',
    subtitle: 'Créez des tampons numériques professionnels en quelques secondes.',
    topText: 'Texte Supérieur',
    bottomText: 'Texte Inférieur',
    centerText: 'Texte Central',
    shape: 'Forme',
    color: 'Couleur',
    borderWidth: 'Largeur de Bordure',
    download: 'Télécharger',
    aiSuggest: 'Suggestion IA',
    aiPromptPlaceholder: 'ex., Café, Cabinet d\'avocats...',
    generating: 'Génération...',
    circle: 'Cercle',
    square: 'Carré',
    oval: 'Ovale',
    red: 'Rouge',
    blue: 'Bleu',
    black: 'Noir',
    green: 'Vert',
    preview: 'Aperçu',
    settings: 'Paramètres',
    descriptionTitle: 'À propos de cet outil',
    seoText: 'Ce créateur de sceaux en ligne gratuit vous permet de créer des tampons et sceaux numériques personnalisés sans inscription. Idéal pour les entreprises, les documents officiels ou les projets créatifs. Les fonctionnalités incluent le support multilingue, l\'exportation PNG haute résolution et des suggestions de texte par IA.',
    font: 'Style de Police',
    serif: 'Serif',
    sans: 'Sans-Serif'
  }
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly currentLang = signal<Language>('en');

  readonly t = computed(() => DICTIONARY[this.currentLang()]);

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
}
