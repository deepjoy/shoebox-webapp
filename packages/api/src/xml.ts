import { XMLParser, XMLBuilder } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => {
    // S3 responses may have single-element arrays that need to stay as arrays
    const arrayTags = [
      "Contents",
      "CommonPrefixes",
      "Bucket",
      "Deleted",
      "Error",
      "Part",
      "Upload",
      "Tag",
      "DuplicateGroup",
      "DuplicateDirGroup",
      "File",
      "Discrepancy",
      "Directory",
      "Difference",
      "DirStats",
    ];
    return arrayTags.includes(name);
  },
});

const builder = new XMLBuilder({
  format: true,
  ignoreAttributes: true,
});

/** Parse an XML string into a JS object. */
export function parseXml<T = Record<string, unknown>>(xml: string): T {
  return parser.parse(xml) as T;
}

/** Build an XML string from a JS object. */
export function buildXml(obj: Record<string, unknown>): string {
  return builder.build(obj) as string;
}
