// TODO: extract to deps.ts file
import { parse } from "https://deno.land/x/swc@0.2.0/mod.ts";

function parseSource(code: string) {
  return parse(code, {
    target: "es2021",
    tsx: true,
    syntax: "typescript",
    comments: false
  });
}

export { parseSource };
