import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      students: 'Students',
      attendance: 'Attendance',
      records: 'Records',
      schedule: 'Schedule',
      profile: 'Profile',
    },
  },
  es: {
    translation: {
      dashboard: 'Panel',
      students: 'Estudiantes',
      attendance: 'Asistencia',
      records: 'Registros',
      schedule: 'Horario',
      profile: 'Perfil',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;

