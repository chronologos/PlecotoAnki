import * as http from "http";
import { argv } from "process";
import { readFileSync } from "fs";
import { config } from "./config";
import { NewNote, AnkiConnectResult } from "./types";

// use:
// export flashcards from Pleco. e.g. to ~/Desktop/flash.txt
// build: `npm run build`
// run: `node index.js ~/Desktop/flash.txt`

// note type: Chinese
// fields: english, chinese, pinyin, extra

export const noteExists = async (query: string): Promise<boolean> => {
  const res = await invokeAnkiConnect(
    config.ANKI_CONNECT_FINDNOTES,
    config.ANKI_CONNECT_VERSION,
    { query: query }
  );
  return res.result != null && res.result.length > 0;
};

export const batchAddNotes = async (lines: string[][]): Promise<any> => {
  const newNotes = lines.map((b) => lineToAnkiConnectNote(b));
  return invokeAnkiConnect(
    config.ANKI_CONNECT_ADDNOTES,
    config.ANKI_CONNECT_VERSION,
    { notes: newNotes }
  );
};

export const invokeAnkiConnect = (
  action: string,
  version: number,
  params = {}
): Promise<AnkiConnectResult> => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ action, version, params });
    // using data.length is wrong since the count .length function does not work with unicode characters (like chinese charactres properly, instead treating them as separate unicode chars...
    const req = http.request(
      {
        host: "127.0.0.1",
        path: "/",
        port: "8765",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data, "utf8"),
        },
      },
      (resp) => {
        resp.setEncoding("utf8");
        const headers = resp.headers;
        console.log(data.length);
        const expectedLength = parseInt(headers["content-length"]);
        let str = "";
        let len = 0;
        resp.on("data", function (chunk: string) {
          str += chunk;
          len += chunk.length;
        });
        resp.on("end", () => {
          if (len < expectedLength) {
            reject("message length invalid");
          }
          resolve(JSON.parse(str));
        });
      }
    );
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

const lineToAnkiConnectNote = (line: string[]): NewNote => {
  return {
    deckName: config.ANKI_DECK_FOR_CLOZE_TAG,
    modelName: config.ANKI_MODEL_FOR_CLOZE_TAG,
    fields: {
      chinese: line[0],
      pinyin: line[1],
      english: line.length > 2 ? line[2] : "",
    },
    tags: ["pleco"],
  };
};

const readTsvToLines = (filename: string): string[][] => {
  return readFileSync(filename, "utf8")
    .split("\r\n")
    .map((l) => l.split("\t").filter((s) => s != ""));
};

const main = async () => {
  const myArgs = argv.slice(2);
  console.log("myArgs: ", myArgs);
  const tsvFile = myArgs[0];
  const lines = readTsvToLines(tsvFile);
  const toAdd: string[][] = [];
  // example of Pleco flashcard format
  // chinese   <TAB> pinyin  <TAB> english \r\n
  // 试图[試圖] <TAB> shi4tu2 <TAB> verb attempt to (do sth.); try to (do sth.)
  for (const line of lines) {
    if (line.length < 2) {
      console.log("skipping line ${line}");
      continue;
    }
    if (line.length == 2) {
      const exists = await noteExists(`${line[0]} ${line[1]}`);
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
      const exists = await noteExists(`"${line[0]}" "${line[1]}" "${line[2]}"`);
      console.log(`${exists} - ${line}`);
      if (exists) {
        continue;
      }
      toAdd.push(line);
      continue;
    }
  }
  await batchAddNotes(toAdd);
  console.log("done");
};

main();
