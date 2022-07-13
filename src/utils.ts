// TODO: extract to deps.ts file
import { parse } from "https://deno.land/std/flags/mod.ts";

import * as constants from "./constants.ts";

function regexpFrom(pattern: string = constants.DEFAULT_PATTERN) {
  return new RegExp(`${pattern}=['|"]([\\w|\\d]+)['|"][\\s|>]`, "gim");
}

function readSelectorName(args: string[]) {
  const { selector } = parse(args);
  return selector ?? null;
}

async function readFile(filePath: string) {
  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile(filePath);
  return decoder.decode(data);
}

async function getSelectors(filePath: string, selectorName: string, pattern: RegExp) {
  let match;
  const selectors = [];

  const fileContent = await readFile(filePath);

  while ((match = pattern.exec(fileContent)) !== null) {
    selectors.push({
      name: match[1],
      value: `${selectorName}="${match[1]}"`,
      file: filePath
    });
  }

  return selectors.length > 0 ? selectors : null;
}

export { regexpFrom, readSelectorName, readFile, getSelectors };
