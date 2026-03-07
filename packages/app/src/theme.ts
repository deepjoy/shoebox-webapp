import { createTheme, MantineColorsTuple } from "@mantine/core";

// Palette derived from the CLI demo palette (earthy / natural tones)
//   AKAROA   #d8c6b0 — headings
//   CORAL    #c5b99b — notes, dim text
//   MONGOOSE #b7a77b — commands
//   AVOCADO  #8e9b69 — steps, success
//   COMO     #496e5d — banners, dividers

const akaroa: MantineColorsTuple = [
  "#faf6f1", // 0 – lightest
  "#f0e8dd",
  "#e4d5c2",
  "#d8c6b0", // 3 – base
  "#c9b49a",
  "#b9a184",
  "#a88e6f",
  "#8f7758",
  "#6e5b43",
  "#4e4030", // 9 – darkest
];

const coral: MantineColorsTuple = [
  "#f8f5ef",
  "#ede8dc",
  "#ddd4be",
  "#c5b99b", // 3 – base
  "#b3a582",
  "#a1916a",
  "#8e7d53",
  "#756742",
  "#5a4f33",
  "#403825",
];

const mongoose: MantineColorsTuple = [
  "#f5f2ea",
  "#e8e2d3",
  "#d6ccb0",
  "#b7a77b", // 3 – base
  "#a69566",
  "#948352",
  "#82713f",
  "#6b5d33",
  "#534828",
  "#3c341d",
];

const avocado: MantineColorsTuple = [
  "#f1f4ec",
  "#dfe6d4",
  "#c5d2ac",
  "#a9bc84",
  "#8e9b69", // 4 – base
  "#7a8a55",
  "#677843",
  "#546235",
  "#414c28",
  "#2e361c",
];

const como: MantineColorsTuple = [
  "#edf3f0",
  "#d5e3db",
  "#afc9be",
  "#86ae9f",
  "#629383",
  "#496e5d", // 5 – base
  "#3d5e4f",
  "#314d40",
  "#253c31",
  "#1a2b23",
];

export const theme = createTheme({
  primaryColor: "como",
  colors: {
    akaroa,
    coral,
    mongoose,
    avocado,
    como,
  },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  headings: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
});
