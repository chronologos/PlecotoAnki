"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.invokeAnkiConnect = exports.batchAddNotes = exports.noteExists = void 0;
var http = require("http");
var process_1 = require("process");
var fs_1 = require("fs");
var config_1 = require("./config");
// use:
// export flashcards from Pleco. e.g. to ~/Desktop/flash.txt
// build: `npm run build`
// run: `node index.js ~/Desktop/flash.txt`
// note type: Chinese
// fields: english, chinese, pinyin, extra
var noteExists = function (query) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.invokeAnkiConnect)(config_1.config.ANKI_CONNECT_FINDNOTES, config_1.config.ANKI_CONNECT_VERSION, { query: query })];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.result != null && res.result.length > 0];
        }
    });
}); };
exports.noteExists = noteExists;
var batchAddNotes = function (lines) { return __awaiter(void 0, void 0, void 0, function () {
    var newNotes;
    return __generator(this, function (_a) {
        newNotes = lines.map(function (b) { return lineToAnkiConnectNote(b); });
        return [2 /*return*/, (0, exports.invokeAnkiConnect)(config_1.config.ANKI_CONNECT_ADDNOTES, config_1.config.ANKI_CONNECT_VERSION, { notes: newNotes })];
    });
}); };
exports.batchAddNotes = batchAddNotes;
var invokeAnkiConnect = function (action, version, params) {
    if (params === void 0) { params = {}; }
    return new Promise(function (resolve, reject) {
        var data = JSON.stringify({ action: action, version: version, params: params });
        // using data.length is wrong since the count .length function does not work with unicode characters (like chinese charactres properly, instead treating them as separate unicode chars...
        var req = http.request({
            host: "127.0.0.1",
            path: "/",
            port: "8765",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data, "utf8")
            }
        }, function (resp) {
            resp.setEncoding("utf8");
            var headers = resp.headers;
            console.log(data.length);
            var expectedLength = parseInt(headers["content-length"]);
            var str = "";
            var len = 0;
            resp.on("data", function (chunk) {
                str += chunk;
                len += chunk.length;
            });
            resp.on("end", function () {
                if (len < expectedLength) {
                    reject("message length invalid");
                }
                resolve(JSON.parse(str));
            });
        });
        req.write(data);
        req.end();
        // xhr.addEventListener("load", () => {
        //   try {
        //     const response = JSON.parse(xhr.responseText);
        //     if (Object.getOwnPropertyNames(response).length !== 2) {
        //       throw Error("response has an unexpected number of fields");
        //     }
        //     if (!Object.prototype.hasOwnProperty.call(response, "error")) {
        //       throw Error("response is missing required error field");
        //     }
        //     if (!Object.prototype.hasOwnProperty.call(response, "result")) {
        //       throw Error("response is missing required result field");
        //     }
        //     if (response.error) {
        //       throw response.error;
        //     }
        //     resolve(response.result);
        //   } catch (e) {
        //     reject(e);
        //   }
    });
    // xhr.open("POST", "http://localhost:8765");
    // console.log(JSON.stringify({ action, version, params }));
    // xhr.send(JSON.stringify({ action, version, params }));
};
exports.invokeAnkiConnect = invokeAnkiConnect;
var lineToAnkiConnectNote = function (line) {
    return {
        deckName: config_1.config.ANKI_DECK_FOR_CLOZE_TAG,
        modelName: config_1.config.ANKI_MODEL_FOR_CLOZE_TAG,
        fields: {
            chinese: line[0],
            pinyin: line[1],
            english: line.length > 2 ? line[2] : ""
        },
        tags: ["pleco"]
    };
};
var readTsvToLines = function (filename) {
    return (0, fs_1.readFileSync)(filename, "utf8")
        .split("\r\n")
        .map(function (l) { return l.split("\t").filter(function (s) { return s != ""; }); });
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var myArgs, tsvFile, lines, toAdd, _i, lines_1, line, exists, simplifiedChinese, replacer, exists;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                myArgs = process_1.argv.slice(2);
                console.log("myArgs: ", myArgs);
                tsvFile = myArgs[0];
                lines = readTsvToLines(tsvFile);
                toAdd = [];
                _i = 0, lines_1 = lines;
                _a.label = 1;
            case 1:
                if (!(_i < lines_1.length)) return [3 /*break*/, 6];
                line = lines_1[_i];
                if (line.length < 2) {
                    console.log("skipping line ${line}");
                    return [3 /*break*/, 5];
                }
                if (!(line.length == 2)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, exports.noteExists)("".concat(line[0], " ").concat(line[1]))];
            case 2:
                exists = _a.sent();
                console.log("".concat(exists, " - ").concat(line));
                if (exists) {
                    return [3 /*break*/, 5];
                }
                toAdd.push(line);
                return [3 /*break*/, 5];
            case 3:
                if (!(line.length >= 3)) return [3 /*break*/, 5];
                simplifiedChinese = line[0].replace(/([^[\]]*)(\[.*\])?/g, "$1");
                replacer = new RegExp(simplifiedChinese, "g");
                line[2] = line[2].replace(replacer, "??");
                return [4 /*yield*/, (0, exports.noteExists)("\"".concat(line[0], "\" \"").concat(line[1], "\" \"").concat(line[2], "\""))];
            case 4:
                exists = _a.sent();
                console.log("".concat(exists, " - ").concat(line));
                if (exists) {
                    return [3 /*break*/, 5];
                }
                toAdd.push(line);
                return [3 /*break*/, 5];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [4 /*yield*/, (0, exports.batchAddNotes)(toAdd)];
            case 7:
                _a.sent();
                console.log("done");
                return [2 /*return*/];
        }
    });
}); };
main();
