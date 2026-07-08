import { getRouteForSection, INITIAL_GATES, INITIAL_CONCESSIONS } from "../lib/stadiumData";

describe("stadiumData - getRouteForSection", () => {
  test("should resolve correct optimal gate for section 114", () => {
    const result = getRouteForSection(114, INITIAL_GATES, INITIAL_CONCESSIONS);
    
    // Gate B serves sections including 114
    expect(result.optimalGate.id).toBe("gate-b");
    expect(result.secondaryGate.id).not.toBe("gate-b");
  });

  test("should resolve correct optimal gate for section 128", () => {
    const result = getRouteForSection(128, INITIAL_GATES, INITIAL_CONCESSIONS);
    
    // Gate D serves sections including 128
    expect(result.optimalGate.id).toBe("gate-d");
  });

  test("should prioritize eco-friendly concessions first", () => {
    const result = getRouteForSection(114, INITIAL_GATES, INITIAL_CONCESSIONS);
    
    // Check that we returned exactly 3 concessions
    expect(result.closestConcessions).toHaveLength(3);
    
    // Check that eco-friendly concessions appear before non-eco ones
    const firstCon = result.closestConcessions[0];
    expect(firstCon.isEcoFriendly).toBe(true);
  });

  test("should return upper-level accessibility notes for section 300+", () => {
    const result = getRouteForSection(320, INITIAL_GATES, INITIAL_CONCESSIONS);
    
    expect(result.accessibilityNotes).toContain("Escalators");
    expect(result.accessibilityNotes).toContain("Sensory bags");
  });

  test("should return lower-level accessibility notes for section 100-199", () => {
    const result = getRouteForSection(115, INITIAL_GATES, INITIAL_CONCESSIONS);
    
    expect(result.accessibilityNotes).toContain("Elevators operate at Sections");
  });
});
