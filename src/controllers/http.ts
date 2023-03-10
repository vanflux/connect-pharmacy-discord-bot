import express, { Application, json } from "express";

export class HttpController {
  public app!: Application;

  public async initialize() {
    console.log('[HttpController] Initializing');
    this.app = express();
    this.app.use(json());
    this.app.listen(3000);
    console.log('[HttpController] Initialized');
  }
}

export const http = new HttpController();
