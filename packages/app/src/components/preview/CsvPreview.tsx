import { Center, Loader, Alert, Table, ScrollArea, Text } from "@mantine/core";
import { useObjectText } from "../../hooks/useObjectBlobUrl";
import { useQuery } from "@tanstack/react-query";

const MAX_ROWS_DISPLAY = 500;

interface CsvPreviewProps {
  bucket: string;
  objectKey: string;
}

export default function CsvPreview({ bucket, objectKey }: CsvPreviewProps) {
  const { data: text, isLoading, error } = useObjectText(bucket, objectKey);

  const ext = objectKey.split(".").pop()?.toLowerCase();
  const delimiter = ext === "tsv" ? "\t" : ",";

  const { data: parsed, isLoading: isParsing } = useQuery({
    queryKey: ["csv-parse", bucket, objectKey],
    queryFn: async () => {
      const Papa = await import(/* @vite-ignore */ "https://esm.sh/papaparse@5.5.3");
      return Papa.default.parse<string[]>(text!, {
        delimiter,
        header: false,
        preview: MAX_ROWS_DISPLAY + 1,
      });
    },
    enabled: text != null,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (isLoading || isParsing) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Preview failed">
        {error instanceof Error ? error.message : "Could not load CSV"}
      </Alert>
    );
  }

  if (!parsed || parsed.data.length === 0) return null;

  const [header, ...rows] = parsed.data;
  const truncated = rows.length >= MAX_ROWS_DISPLAY;

  return (
    <>
      <ScrollArea style={{ maxHeight: 500 }}>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              {header.map((col, i) => (
                <Table.Th key={i}>{col}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, ri) => (
              <Table.Tr key={ri}>
                {row.map((cell, ci) => (
                  <Table.Td key={ci}>{cell}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      {truncated && (
        <Text size="sm" c="dimmed" ta="center" mt="xs">
          Showing first {MAX_ROWS_DISPLAY} rows
        </Text>
      )}
    </>
  );
}
