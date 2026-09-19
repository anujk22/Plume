import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:60000,fullyParallel:false,workers:1,use:{baseURL:process.env.PLUME_URL||'http://localhost:5173',headless:true,viewport:{width:1440,height:960}},reporter:'list'});
