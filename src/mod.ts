import type { Selector } from "./types.ts";
import * as utils from "./utils.ts";
import * as assert from "./assert.ts";
import * as ast from "./ast.ts";

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

        const fileContent = await utils.readFile(filePath);
        const sourceAst = ast.parseSource(fileContent);

        console.log("AST :: \n", JSON.stringify(sourceAst, null, 2));
        // TODO: extract `JSXAttribute`s from sourceAst

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
