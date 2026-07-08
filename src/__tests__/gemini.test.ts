import { getFanAIResponse, getOpsAIAdvice } from "../lib/gemini";
import { INITIAL_GATES, INITIAL_CONCESSIONS, INITIAL_TRANSIT, INITIAL_INCIDENTS } from "../lib/stadiumData";

describe("gemini - client-side fetch wrappers", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test("getFanAIResponse should fetch from /api/chat and return the parsed JSON", async () => {
    const mockResponse = {
      text: "According to MetLife Stadium guidelines: Sensory bags are available at Section 124.",
      detectedLanguage: "English",
      suggestedAction: { label: "Check Accessibility Routes", action: "accessibility" }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getFanAIResponse("Where are sensory bags?");

    expect(global.fetch).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ message: "Where are sensory bags?" })
    }));
    expect(result).toEqual(mockResponse);
  });

  test("getOpsAIAdvice should fetch from /api/advice and return the parsed JSON", async () => {
    const mockAdvice = {
      alerts: ["High congestion at Gate B"],
      recommendations: [
        {
          title: "Reroute from Gate B",
          description: "Gate B is busy",
          priority: "High",
          impactArea: "Gate Entry",
          suggestedAction: "Reroute to Gate A"
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdvice,
    });

    const result = await getOpsAIAdvice(
      INITIAL_GATES,
      INITIAL_CONCESSIONS,
      INITIAL_TRANSIT,
      INITIAL_INCIDENTS
    );

    expect(global.fetch).toHaveBeenCalledWith("/api/advice", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        gates: INITIAL_GATES,
        concessions: INITIAL_CONCESSIONS,
        transits: INITIAL_TRANSIT,
        incidents: INITIAL_INCIDENTS
      })
    }));
    expect(result).toEqual(mockAdvice);
  });

  test("getFanAIResponse should fall back to local heuristic simulation on fetch failure", async () => {
    // Force fetch to reject/throw error to test fallbacks
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    // Query containing keyword "sensory" will match the accessibility category fallback
    const result = await getFanAIResponse("Where are sensory bags?");

    expect(result.text).toContain("Sensory bags");
    expect(result.detectedLanguage).toBe("English");
  });
});
