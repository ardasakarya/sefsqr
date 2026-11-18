import pagesRaw from "./pages.json";

/* Yasal sayfalar — yalnızca o sayfalar açılınca iner */
export interface LegalPage {
  title: string;
  lead: string;
  updated: string;
  html: string;
}
export const pages = pagesRaw as Record<string, LegalPage>;
