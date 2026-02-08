/**
 * Language Toggle Component
 * Switches between English and Nepali
 */
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('kwpm-language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
      title={i18n.language === 'en' ? 'नेपालीमा परिवर्तन गर्नुहोस्' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === 'en' ? 'नेपाली' : 'English'}</span>
    </button>
  );
}
