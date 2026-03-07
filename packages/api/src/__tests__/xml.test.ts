import { describe, it, expect } from "vitest";
import { parseXml, buildXml } from "../xml";

describe("parseXml", () => {
  it("parses a simple XML element", () => {
    const result = parseXml<{ Root: { Name: string } }>("<Root><Name>test</Name></Root>");
    expect(result.Root.Name).toBe("test");
  });

  it("parses array tags as arrays even with a single element", () => {
    const xml = `
      <ListBucketResult>
        <Contents><Key>file.txt</Key></Contents>
      </ListBucketResult>`;
    const result = parseXml<{ ListBucketResult: { Contents: { Key: string }[] } }>(xml);
    expect(Array.isArray(result.ListBucketResult.Contents)).toBe(true);
    expect(result.ListBucketResult.Contents).toHaveLength(1);
  });

  it("parses multiple array elements", () => {
    const xml = `
      <ListAllMyBucketsResult>
        <Bucket><Name>a</Name></Bucket>
        <Bucket><Name>b</Name></Bucket>
      </ListAllMyBucketsResult>`;
    const result = parseXml<{ ListAllMyBucketsResult: { Bucket: { Name: string }[] } }>(xml);
    expect(result.ListAllMyBucketsResult.Bucket).toHaveLength(2);
  });
});

describe("buildXml", () => {
  it("builds XML from an object", () => {
    const xml = buildXml({ Root: { Name: "test" } });
    expect(xml).toContain("<Name>test</Name>");
    expect(xml).toContain("<Root>");
  });
});
