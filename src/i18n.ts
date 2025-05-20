import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

console.log("i18n.ts: Iniciando configuração do i18next");

// Importar arquivos de tradução
import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';
import translationRU from './locales/ru/translation.json';

console.log("i18n.ts: Arquivos de tradução importados com sucesso");

const resources = {
  en: {
    translation: translationEN,
  },
  pt: {
    translation: translationPT,
  },
  ru: {
    translation: translationRU,
  },
};

console.log("i18n.ts: Configurando i18next com recursos", Object.keys(resources));

i18n
  .use(LanguageDetector) // Detecta o idioma do navegador
  .use(initReactI18next) // Passa a instância do i18n para o react-i18next
  .init({
    resources,
    fallbackLng: 'pt', // Idioma padrão caso o detectado não esteja disponível
    interpolation: {
      escapeValue: false, // React já faz o escape de XSS
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  })
  .then(() => {
    console.log("i18n.ts: i18next inicializado com sucesso. Idioma atual:", i18n.language);
  })
  .catch(error => {
    console.error("i18n.ts: Erro ao inicializar i18next:", error);
  });

console.log("i18n.ts: Configuração concluída, exportando instância");

export default i18n; 