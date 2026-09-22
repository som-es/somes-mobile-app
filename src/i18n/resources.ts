import deATAuth from './locales/de-AT/auth.json';
import deATCommon from './locales/de-AT/common.json';
import deATDelegates from './locales/de-AT/delegates.json';
import deATFavorites from './locales/de-AT/favorites.json';
import deATFilters from './locales/de-AT/filters.json';
import deATHome from './locales/de-AT/home.json';
import deATImpressum from './locales/de-AT/impressum.json';
import deATNotifications from './locales/de-AT/notifications.json';
import deATProfile from './locales/de-AT/profile.json';
import deATQuestions from './locales/de-AT/questions.json';
import deATVotes from './locales/de-AT/votes.json';
import enGBAuth from './locales/en-GB/auth.json';
import enGBCommon from './locales/en-GB/common.json';
import enGBDelegates from './locales/en-GB/delegates.json';
import enGBFavorites from './locales/en-GB/favorites.json';
import enGBFilters from './locales/en-GB/filters.json';
import enGBHome from './locales/en-GB/home.json';
import enGBImpressum from './locales/en-GB/impressum.json';
import enGBNotifications from './locales/en-GB/notifications.json';
import enGBProfile from './locales/en-GB/profile.json';
import enGBQuestions from './locales/en-GB/questions.json';
import enGBVotes from './locales/en-GB/votes.json';

export const resources = {
  'de-AT': {
    common: deATCommon,
    home: deATHome,
    votes: deATVotes,
    delegates: deATDelegates,
    profile: deATProfile,
    auth: deATAuth,
    favorites: deATFavorites,
    notifications: deATNotifications,
    filters: deATFilters,
    impressum: deATImpressum,
    questions: deATQuestions,
  },
  'en-GB': {
    common: enGBCommon,
    home: enGBHome,
    votes: enGBVotes,
    delegates: enGBDelegates,
    profile: enGBProfile,
    auth: enGBAuth,
    favorites: enGBFavorites,
    notifications: enGBNotifications,
    filters: enGBFilters,
    impressum: enGBImpressum,
    questions: enGBQuestions,
  },
} as const;

export const NAMESPACES = Object.keys(resources['de-AT']);
