import { SOURCE_CODE } from "./constants.ts";

function isSourceCode(file: Deno.DirEntry) {
  SOURCE_CODE.lastIndex = 0;
  return SOURCE_CODE.test(file.name);
}

function isHiddenFile(file: Deno.DirEntry) {
  return file.name.startsWith(".");
}

export { isSourceCode, isHiddenFile };
