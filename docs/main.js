import { Application, appUpdate } from './editor/app/Application.js';

export const app = new Application(document.getElementById("appContainer"));

app.init();

appUpdate(app);