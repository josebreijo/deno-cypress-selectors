import type { Selector } from "./types.ts";
import * as utils from "./utils.ts";
import * as assert from "./assert.ts";

const PATH = await Deno.realPath("./");

function getReader(selectorName: string) {
  const pattern = utils.regexpFrom(selectorName);

  return async function* traverse(cwd: string): AsyncGenerator<Selector[]> {
    const directoryFiles = await Deno.readDir(cwd);

    for await (const file of directoryFiles) {
      const filePath = `${cwd}/${file.name}`;

      if (file.isDirectory) {
        if (assert.isHiddenFile(file)) {
          console.log("skipping hidden directory:", file.name);
          continue;
        }

        yield* traverse(filePath);
      } else {
        if (!assert.isSourceCode(file)) {
          console.log("skipping non-source file:", file.name);
          continue;
        }

        const cypressSelectors = await utils.getSelectors(filePath, selectorName, pattern);

        if (cypressSelectors !== null) {
          yield cypressSelectors;
        }
      }
    }
  };
}

const selectorName = utils.readSelectorName(Deno.args);
const readSelectors = getReader(selectorName);

for await (const selectors of readSelectors(PATH)) {
  console.log(selectors);
}
