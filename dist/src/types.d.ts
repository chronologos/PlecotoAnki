export interface Note {
    noteId: string;
    fields: any;
    block_time: string;
    block_uid: string;
}
export interface NewNote {
    id?: string;
    deckName?: string;
    modelName?: string;
    fields?: any;
    tags?: string[];
}
export interface AnkiConnectResult {
    result: Object[];
    error: Object[];
}
declare global {
    interface Window {
        roamAlphaAPI: any;
    }
    interface getAttrConfigFromQuery {
    }
}
