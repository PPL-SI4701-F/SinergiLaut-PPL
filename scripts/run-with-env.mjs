import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , envFileArg, ...commandArgs] = process.argv;

if (!envFileArg || commandArgs.length === 0) {
  console.error("Usage: node scripts/run-with-env.mjs <env-file> <command> [...args]");
  process.exit(1);
}

function parseEnv(contents) {
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadEnvFile(fileName, required) {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) {
    if (required) {
      console.error(`Missing required env file: ${fileName}`);
      process.exit(1);
    }
    return;
  }

  Object.assign(process.env, parseEnv(fs.readFileSync(filePath, "utf8")));
}

loadEnvFile(".env", false);
loadEnvFile(envFileArg, true);

const [command, ...args] = commandArgs;
const child = spawn(command, args, {
  env: process.env,
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
