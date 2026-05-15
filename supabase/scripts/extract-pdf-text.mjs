import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";

function unescapePdfString(value) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, ch) => {
      const map = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" };
      return map[ch] ?? ch;
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}

function decodeHexString(value) {
  const clean = value.replace(/\s+/g, "");
  let text = "";
  for (let i = 0; i < clean.length; i += 2) {
    const code = Number.parseInt(clean.slice(i, i + 2).padEnd(2, "0"), 16);
    if (Number.isFinite(code) && code > 0) text += String.fromCharCode(code);
  }
  return text;
}

function parseCMap(stream) {
  const map = new Map();
  const bfchar = /beginbfchar([\s\S]*?)endbfchar/g;
  const bfrange = /beginbfrange([\s\S]*?)endbfrange/g;
  let match;

  while ((match = bfchar.exec(stream))) {
    const pairs = match[1].matchAll(/<([\da-fA-F]+)>\s*<([\da-fA-F]+)>/g);
    for (const pair of pairs) {
      map.set(Number.parseInt(pair[1], 16), String.fromCodePoint(Number.parseInt(pair[2], 16)));
    }
  }

  while ((match = bfrange.exec(stream))) {
    const ranges = match[1].matchAll(/<([\da-fA-F]+)>\s*<([\da-fA-F]+)>\s*(?:<([\da-fA-F]+)>|\[([\s\S]*?)\])/g);
    for (const range of ranges) {
      const start = Number.parseInt(range[1], 16);
      const end = Number.parseInt(range[2], 16);
      if (range[3]) {
        const outStart = Number.parseInt(range[3], 16);
        for (let code = start; code <= end; code += 1) {
          map.set(code, String.fromCodePoint(outStart + code - start));
        }
      } else if (range[4]) {
        const values = [...range[4].matchAll(/<([\da-fA-F]+)>/g)].map((item) => Number.parseInt(item[1], 16));
        for (let i = 0; i < values.length; i += 1) {
          map.set(start + i, String.fromCodePoint(values[i]));
        }
      }
    }
  }

  return map;
}

function decodeCodes(raw, cmap) {
  if (!cmap.size) return raw;
  let output = "";
  for (let i = 0; i < raw.length; i += 1) {
    const one = raw.charCodeAt(i);
    const two = i + 1 < raw.length ? (one << 8) + raw.charCodeAt(i + 1) : null;
    if (two !== null && cmap.has(two)) {
      output += cmap.get(two);
      i += 1;
    } else if (cmap.has(one)) {
      output += cmap.get(one);
    } else if (one >= 32 && one <= 126) {
      output += raw[i];
    }
  }
  return output;
}

function extractTextFromStream(stream, cmap) {
  const parts = [];
  const textOps = /(\((?:\\.|[^\\)])*\)|<[\da-fA-F\s]+>)\s*Tj|\[((?:.|\n|\r)*?)\]\s*TJ/g;
  let match;

  while ((match = textOps.exec(stream))) {
    if (match[1]) {
      const raw = match[1].startsWith("<") ? decodeHexString(match[1].slice(1, -1)) : unescapePdfString(match[1].slice(1, -1));
      parts.push(decodeCodes(raw, cmap));
    }

    if (match[2]) {
      const array = match[2];
      const strings = array.match(/\((?:\\.|[^\\)])*\)|<[\da-fA-F\s]+>/g) ?? [];
      for (const item of strings) {
        const raw = item.startsWith("<") ? decodeHexString(item.slice(1, -1)) : unescapePdfString(item.slice(1, -1));
        parts.push(decodeCodes(raw, cmap));
      }
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function extract(path) {
  const buffer = readFileSync(path);
  const binary = buffer.toString("binary");
  const streamRegex = /(<<[\s\S]*?>>)\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const streams = [];
  let match;

  while ((match = streamRegex.exec(binary))) {
    const dictionary = match[1];
    const raw = Buffer.from(match[2], "binary");
    let content = null;

    if (/\/FlateDecode\b/.test(dictionary)) {
      try {
        content = inflateSync(raw).toString("latin1");
      } catch {
        continue;
      }
    } else {
      content = raw.toString("latin1");
    }

    streams.push(content);
  }

  const cmap = new Map();
  for (const content of streams) {
    for (const [key, value] of parseCMap(content)) cmap.set(key, value);
  }

  const texts = [];
  for (const content of streams) {
    const text = extractTextFromStream(content, cmap);
    if (text) texts.push(text);
  }

  return texts.join("\n\n").replace(/(?:\b[\w`’'./-]\b\s*){4,}/g, (run) => run.replace(/\s+/g, ""));
}

for (const path of process.argv.slice(2)) {
  console.log(`\n===== ${path} =====\n`);
  console.log(extract(path));
}
