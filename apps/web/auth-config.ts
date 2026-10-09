import {publicFirebaseConfig} from './deployment.ts';
const defaults=import.meta.env.PROD?publicFirebaseConfig:undefined;
export const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY||defaults?.apiKey,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN||defaults?.authDomain,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID||defaults?.projectId};
export const configured=Boolean(config.apiKey&&config.authDomain&&config.projectId);
