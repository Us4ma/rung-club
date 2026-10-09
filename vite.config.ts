import {defineConfig} from 'vite';
export default defineConfig({root:'apps/web',server:{proxy:{'/api':'http://127.0.0.1:8787','/socket':{target:'ws://127.0.0.1:8787',ws:true}}},build:{outDir:'../../dist',emptyOutDir:true,rollupOptions:{output:{manualChunks:(id:string)=>id.includes('phaser')?'phaser':id.includes('react')?'react':undefined}}}});
