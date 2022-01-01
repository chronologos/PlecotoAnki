"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeAnkiConnect = exports.batchAddNotes = exports.noteExists = void 0;
const tslib_1 = require("tslib");
const http = (0, tslib_1.__importStar)(require("http"));
const process_1 = require("process");
const fs_1 = require("fs");
const config_1 = require("./config");
const noteExists = (query) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const res = yield (0, exports.invokeAnkiConnect)(config_1.config.ANKI_CONNECT_FINDNOTES, config_1.config.ANKI_CONNECT_VERSION, { query: query });
    return res.result != null && res.result.length > 0;
});
exports.noteExists = noteExists;
const batchAddNotes = (lines) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const newNotes = lines.map((b) => lineToAnkiConnectNote(b));
    return (0, exports.invokeAnkiConnect)(config_1.config.ANKI_CONNECT_ADDNOTES, config_1.config.ANKI_CONNECT_VERSION, { notes: newNotes });
});
exports.batchAddNotes = batchAddNotes;
const invokeAnkiConnect = (action, version, params = {}) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ action, version, params });
        // using data.length is wrong since the count .length function does not work with unicode characters (like chinese charactres properly, instead treating them as separate unicode chars...
        const req = http.request({
            host: "127.0.0.1",
            path: "/",
            port: "8765",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data, "utf8"),
            },
        }, (resp) => {
            resp.setEncoding("utf8");
            const headers = resp.headers;
            console.log(data.length);
            if (headers["content-length"] == null) {
                reject("content-length invalid");
            }
            const contentLength = headers["content-length"];
            if (contentLength === undefined) {
                reject("bad content-length");
            }
            const expectedLength = parseInt(contentLength);
            let str = "";
            let len = 0;
            resp.on("data", function (chunk) {
                str += chunk;
                len += chunk.length;
            });
            resp.on("end", () => {
                if (len < expectedLength) {
                    reject("message length invalid");
                }
                resolve(JSON.parse(str));
            });
        });
        req.write(data);
        req.end();
    });
};
exports.invokeAnkiConnect = invokeAnkiConnect;
const lineToAnkiConnectNote = (line) => {
    return {
        deckName: config_1.config.ANKI_DECK_FOR_CLOZE_TAG,
        modelName: config_1.config.ANKI_MODEL_FOR_CLOZE_TAG,
        fields: {
            chinese: line[0],
            pinyin: line[1],
            english: line.length > 2 ? line[2] : "",
        },
        tags: ["pleco"],
    };
};
const readTsvToLines = (filename) => {
    return (0, fs_1.readFileSync)(filename, "utf8")
        .split("\r\n")
        .map((l) => l.split("\t").filter((s) => s != ""));
};
const main = () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const myArgs = process_1.argv.slice(2);
    console.log("myArgs: ", myArgs);
    const tsvFile = myArgs[0];
    const lines = readTsvToLines(tsvFile);
    const toAdd = [];
    // example of Pleco flashcard format
    // chinese   <TAB> pinyin  <TAB> english \r\n
    // 试图[試圖] <TAB> shi4tu2 <TAB> verb attempt to (do sth.); try to (do sth.)
    for (const line of lines) {
        if (line.length < 2) {
            console.log("skipping line ${line}");
            continue;
        }
        if (line.length == 2) {
            const exists = yield (0, exports.noteExists)(`${line[0]} ${line[1]}`);
            console.log(`${exists} - ${line}`);
            if (exists) {
                continue;
            }
            toAdd.push(line);
            continue;
        }
        if (line.length >= 3) {
            // Pleco likes to use the Chinese word in the definition/example section as well. So we need to do some censoring.
            // In the chinese column, we can get both simplified and traditional representations in this format: 著名[著名]
            const simplifiedChinese = line[0].replace(/([^[\]]*)(\[.*\])?/g, "$1");
            const replacer = new RegExp(simplifiedChinese, "g");
            line[2] = line[2].replace(replacer, "??");
            const exists = yield (0, exports.noteExists)(`"${line[0]}" "${line[1]}" "${line[2]}"`);
            console.log(`${exists} - ${line}`);
            if (exists) {
                continue;
            }
            toAdd.push(line);
            continue;
        }
    }
    yield (0, exports.batchAddNotes)(toAdd);
    console.log("done");
});
main();
//# sourceMappingURL=index.js.map