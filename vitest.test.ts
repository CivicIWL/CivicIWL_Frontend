import { describe, it, expect } from "vitest";

// utility function
const add = (a: number, b: number) => a + b;

describe("Example Passing Tests", () => {
  it("should add numbers correctly", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should always be true", () => {
    expect(true).toBe(true);
  });

  it("should match object structure", () => {
    const user = { id: 1, name: "Kelvin" };
    expect(user).toMatchObject({ name: "Kelvin" });
  });

  it("should contain item in array", () => {
    const fruits = ["apple", "banana", "mango"];
    expect(fruits).toContain("banana");
  });

  it("should handle async operations", async () => {
    const data = await Promise.resolve("done");
    expect(data).toBe("done");
  });

  it("should check number comparisons", () => {
    expect(10).toBeGreaterThan(5);
    expect(3).toBeLessThan(5);
  });

  it("should check string patterns", () => {
    expect("shadcn is great").toMatch(/shadcn/);
  });

  it("should handle deep equality", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(obj1).toEqual(obj2);
  });
});
