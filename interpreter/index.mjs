import { createInterface } from "readline/promises";
import { readFileSync, readSync } from "fs";

function err(msg) {
  console.error(`\x1b[31m${msg}\x1b[0m`);
  process.exit(1);
}

const path = process.argv[2];

if (!path) {
  err("Usage: ... <file>");
}

const result = new Map();

const funcs = new Map()
  .set("nop", [0, () => 0])
  .set("get", [1, (ln) => {
    return result.get(ln) || 0;
  }])
  .set("print", [1, (ln) => {
    const str = (result.get(ln) || 0).toString();
    console.log(str);
    return str.length;
  }])
  .set("write", [1, (ln) => {
    process.stdout.write(String.fromCharCode(result.get(ln) || 0));
    return 1;
  }])
  .set("input", [0, async () => {
    const rl = createInterface(process.stdin, process.stdout);
    const raw = await rl.question("\x1b[1;30minput:\x1b[0m ");
    const num = parseInt(raw);

    if (!raw.match(/^-?\d+$/) || !Number.isSafeInteger(num)) {
      err("invalid input");
    }

    rl.close();
    return num;
  }])
  .set("read", [0, () => {
    process.stdin.setRawMode(true);
    const buffer = Buffer.alloc(1);
    readSync(0, buffer, 0, 1);

    return buffer.toString("utf-8").charCodeAt(0);
  }])
  .set("assert", [1, (ln) => {
    if (!result.has(ln) || result.get(ln) == 0) {
      throw "assert";
    } else {
      return 0;
    }
  }])
  .set("eq", [2, (a, b) => {
    return Number((result.get(a) || 0) == (result.get(b) || 0));
  }])
  .set("lt", [2, (a, b) => {
    return Number((result.get(a) || 0) < (result.get(b) || 0));
  }])
  .set("gt", [2, (a, b) => {
    return Number((result.get(a) || 0) > (result.get(b) || 0));
  }])
  .set("stop", [0, () => {
    process.exit();
  }])
  .set("call", [1, async (ln) => {
    const line = lines.find(([n]) => n == ln);
    await runLine(line[0], line[1]);

    return 0;
  }])
  .set("debug", [-1, (...chars) => {
    console.log(`\x1b[1m[DEBUG]\x1b[1;30m ${chars.map((x) => String.fromCharCode(x)).join("")}\x1b[0m`);
  }]);

const raw = readFileSync(path, "utf-8")
  .split(/\n+/g)
  .map((x) => x.trim());

const lines = [];

for (const line of raw) {
  const m = /^(\d+)(?: +(.+))?$/.exec(line);
  if (!m) continue;
  
  const lineno = parseInt(m[1]);
  const fns = m[2]
    ? m[2].matchAll(/([~!]|)(\w+)\((\-?\d+(?:, *\-?\d+)*|)\)(?: +|$)/gm)
    : [];
  const ln = [];

  if (!Number.isSafeInteger(lineno)) {
    err(`(${m[1]}) Invalid line number`);
  }

  for (const fn of fns) {
    const [, prefix, name, rawArgs] = fn;
    const args = rawArgs ? rawArgs.split(/, */g).map((x) => parseInt(x)) : [];
    
    if (!funcs.has(name)) {
      err(`(${lineno}) Unknown function \`${name}\``);
    } else if (args.find(x => !Number.isSafeInteger(x))) {
      err(`(${lineno}) Invalid arguments: \x1b[1;30m${rawArgs}\x1b[0m`);
    } else {
      const [argc] = funcs.get(name);
      if (argc != args.length && argc >= 0) {
        err(`(${lineno}) Function \`${name}\` requires ${argc} argument${argc == 1 ? "" : "s"} but got ${args.length}`);
      }
    }

    ln.push([prefix, name, args])
  }

  lines.push([lineno, ln]);
}

if (lines.length == 0) {
  err("The file does not contain any valid lines");
}

let line = lines[0], idx = 0;

async function runLine(lineno, fns) {
  let res = 0;
  
  for (const [prefix, name, args] of fns) {
    try {
      const ret = await funcs.get(name)[1](...args);
      res += prefix == "!"
        ? ret == 0
        : prefix == "~"
        ? ~ret
        : ret;
    } catch (err) {
      if (err == "assert") {
        result.set(lineno, (result.get(lineno) || 0) + res);
        return true;
      } else throw err;
    }
  }
  
  result.set(lineno, (result.get(lineno) || 0) + res);
  return false;
}

while (true) {
  const [lineno, fns] = line;
  const assert = await runLine(lineno, fns);

  if (idx > 0 && lineno != lines[idx - 1][0] + 1) {
    idx = lines.findIndex(([n], i) => i != idx && n == lineno);
  }

  line = lines[
    idx += 1 + assert
  ];
  
  if (!line) {
    process.exit();
  }
}