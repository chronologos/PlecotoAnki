import { AnkiConnectResult } from "./types";
export declare const noteExists: (query: string) => Promise<boolean>;
export declare const batchAddNotes: (lines: string[][]) => Promise<any>;
export declare const invokeAnkiConnect: (action: string, version: number, params?: {}) => Promise<AnkiConnectResult>;
