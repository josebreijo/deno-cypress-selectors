import { TS_OR_TSX } from "./constants.ts";

function isSourceCode(file: Deno.DirEntry) {
  return !TS_OR_TSX.test(file.name);
}

async function readFile(filePath: string) {
  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile(filePath);
  return decoder.decode(data);
}

async function readSelectors(root: string, selectors: string[]): Promise<string[]> {
  const nextDirContent = [];
  const directoryFiles = await Deno.readDir(root);

  for await (const file of directoryFiles) {
    const filePath = `${root}/${file.name}`;

    if (file.isDirectory) {
      if (file.name.startsWith(".")) continue;

      nextDirContent.push(readSelectors(filePath, selectors));
    } else {
      if (!isSourceCode(file)) continue;

      const fileContent = await readFile(filePath);
      selectors.push(fileContent);
    }
  }

  const directoryMatches = await (await Promise.all(nextDirContent)).flat();
  return selectors.concat(...directoryMatches);
}

const cwd = await Deno.realPath("./");
const source = await readSelectors(cwd, []);

console.log("source", JSON.stringify(source, null, 2));
