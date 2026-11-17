/// <reference types="vite/client" />

declare module 'turndown' {
  interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: '```' | '~~~';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '__' | '**';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  interface Rule {
    filter: string | string[] | ((node: HTMLElement, options: TurndownOptions) => boolean);
    replacement: (content: string, node: HTMLElement, options: TurndownOptions) => string;
  }

  class TurndownService {
    constructor(options?: TurndownOptions);
    turndown(html: string | HTMLElement): string;
    addRule(key: string, rule: Rule): this;
    keep(filter: string | string[] | ((node: HTMLElement) => boolean)): this;
    remove(filter: string | string[] | ((node: HTMLElement) => boolean)): this;
    use(plugin: any): this;
  }

  export default TurndownService;
}

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number; useCORS?: boolean; letterRendering?: boolean; logging?: boolean };
    jsPDF?: { unit?: string; format?: string | number[]; orientation?: 'portrait' | 'landscape' };
    pagebreak?: { mode?: string | string[]; before?: string; after?: string };
  }

  interface Html2PdfWorker {
    from(element: HTMLElement | string): Html2PdfWorker;
    set(opt: Html2PdfOptions): Html2PdfWorker;
    save(): Promise<void>;
    outputPdf(type?: string): Promise<any>;
    toPdf(): Html2PdfWorker;
    get(type: string): Promise<any>;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}
