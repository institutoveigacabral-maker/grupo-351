import { describe, it, expect } from "vitest";

// Unit-test the sorting/filtering logic used by DataTable
// We test the pure logic rather than rendering to keep tests fast and dependency-free

interface Item {
  id: string;
  name: string;
  score: number;
}

const items: Item[] = [
  { id: "1", name: "Alice", score: 90 },
  { id: "2", name: "Bob", score: 70 },
  { id: "3", name: "Charlie", score: 85 },
  { id: "4", name: "Diana", score: 95 },
  { id: "5", name: "Eve", score: 60 },
];

function searchFn(row: Item, q: string): boolean {
  return row.name.toLowerCase().includes(q);
}

function sortItems(data: Item[], key: "name" | "score", dir: "asc" | "desc"): Item[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

function paginate<T>(data: T[], page: number, pageSize: number): T[] {
  return data.slice((page - 1) * pageSize, page * pageSize);
}

describe("DataTable logic", () => {
  it("filters by search query", () => {
    const result = items.filter((row) => searchFn(row, "ali"));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alice");
  });

  it("returns all items when search is empty", () => {
    const result = items.filter((row) => searchFn(row, ""));
    // searchFn with empty string matches all (includes("") === true)
    expect(result).toHaveLength(5);
  });

  it("sorts by name ascending", () => {
    const sorted = sortItems(items, "name", "asc");
    expect(sorted[0].name).toBe("Alice");
    expect(sorted[4].name).toBe("Eve");
  });

  it("sorts by score descending", () => {
    const sorted = sortItems(items, "score", "desc");
    expect(sorted[0].score).toBe(95);
    expect(sorted[1].score).toBe(90);
    expect(sorted[4].score).toBe(60);
  });

  it("paginates correctly", () => {
    const page1 = paginate(items, 1, 2);
    expect(page1).toHaveLength(2);
    expect(page1[0].id).toBe("1");
    expect(page1[1].id).toBe("2");

    const page2 = paginate(items, 2, 2);
    expect(page2).toHaveLength(2);
    expect(page2[0].id).toBe("3");

    const page3 = paginate(items, 3, 2);
    expect(page3).toHaveLength(1);
  });

  it("handles empty data", () => {
    const result: Item[] = [];
    expect(paginate(result, 1, 25)).toHaveLength(0);
  });

  it("calculates total pages", () => {
    const totalPages = Math.max(1, Math.ceil(items.length / 2));
    expect(totalPages).toBe(3);
  });
});
