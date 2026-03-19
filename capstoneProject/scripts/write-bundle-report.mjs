import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    sourceDir: {
      type: "string",
      default: path.resolve("dist/assets"),
    },
    json: {
      type: "string",
      default: "",
    },
    markdown: {
      type: "string",
      default: "",
    },
    label: {
      type: "string",
      default: "current-build",
    },
  },
});

const toKilobytes = (sizeInBytes) => `${(sizeInBytes / 1024).toFixed(2)} kB`;

const sourceDir = path.resolve(values.sourceDir);
const entries = await readdir(sourceDir, { withFileTypes: true });

const assetFiles = await Promise.all(
  entries
    .filter((entry) => entry.isFile())
    .map(async (entry) => {
      const filePath = path.join(sourceDir, entry.name);
      const contents = await readFile(filePath);
      const extension = path.extname(entry.name).slice(1) || "unknown";

      return {
        file: entry.name,
        extension,
        rawBytes: contents.byteLength,
        gzipBytes: gzipSync(contents).byteLength,
      };
    }),
);

const assets = assetFiles.sort((left, right) => right.rawBytes - left.rawBytes);
const totals = assets.reduce(
  (summary, asset) => {
    summary.rawBytes += asset.rawBytes;
    summary.gzipBytes += asset.gzipBytes;
    summary.byType[asset.extension] ??= { rawBytes: 0, gzipBytes: 0, count: 0 };
    summary.byType[asset.extension].rawBytes += asset.rawBytes;
    summary.byType[asset.extension].gzipBytes += asset.gzipBytes;
    summary.byType[asset.extension].count += 1;
    return summary;
  },
  { rawBytes: 0, gzipBytes: 0, byType: {} },
);

const report = {
  label: values.label,
  sourceDir,
  generatedAt: new Date().toISOString(),
  totals,
  assets,
};

const markdown = [
  `# Bundle Report: ${values.label}`,
  "",
  `- Source directory: \`${sourceDir}\``,
  `- Total raw size: ${toKilobytes(totals.rawBytes)}`,
  `- Total gzip size: ${toKilobytes(totals.gzipBytes)}`,
  "",
  "## Asset Breakdown",
  "",
  "| File | Type | Raw Size | Gzip Size |",
  "| --- | --- | ---: | ---: |",
  ...assets.map(
    (asset) =>
      `| \`${asset.file}\` | ${asset.extension} | ${toKilobytes(asset.rawBytes)} | ${toKilobytes(asset.gzipBytes)} |`,
  ),
  "",
  "## Totals By Type",
  "",
  "| Type | Count | Raw Size | Gzip Size |",
  "| --- | ---: | ---: | ---: |",
  ...Object.entries(totals.byType).map(
    ([type, summary]) =>
      `| ${type} | ${summary.count} | ${toKilobytes(summary.rawBytes)} | ${toKilobytes(summary.gzipBytes)} |`,
  ),
  "",
].join("\n");

console.log(markdown);

if (values.json.length > 0) {
  await writeFile(path.resolve(values.json), `${JSON.stringify(report, null, 2)}\n`);
}

if (values.markdown.length > 0) {
  await writeFile(path.resolve(values.markdown), `${markdown}\n`);
}
