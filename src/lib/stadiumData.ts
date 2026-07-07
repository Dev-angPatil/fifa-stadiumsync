export interface GateInfo {
  id: string;
  name: string;
  status: "Open" | "Closed" | "Delayed";
  queueTimeMin: number; // in minutes
  currentFlow: number; // people per minute
  capacity: number; // max flow
  coordinate: { x: number; y: number }; // Relative percentage coordinates for map visualizer
  servedSections: number[];
}

export interface ConcessionStand {
  id: string;
  name: string;
  type: "Food" | "Beverage" | "Merchandise" | "Mixed";
  status: "Active" | "Busy" | "Inactive";
  queueTimeMin: number;
  featuredItem: string;
  isEcoFriendly: boolean; // Sustainable serving, local sourcing
  location: string; // Section or Gate proximity
  coordinate: { x: number; y: number };
}

export interface ParkingInfo {
  id: string;
  name: string;
  occupancyPercent: number;
  status: "Available" | "Filling Fast" | "Full";
  shuttleFrequencyMin: number;
  accessibilitySpacesFree: number;
}

export interface TransitRoute {
  id: string;
  type: "Train" | "Bus" | "Rideshare" | "Shuttle";
  name: string;
  destination: string;
  status: "Normal" | "Delayed" | "Suspended";
  statusMessage: string;
  nextDepartureMin: number;
}

export interface SustainabilityMetrics {
  energyRenewablePercent: number;
  powerConsumptionKw: number;
  waterSavedGallons: number;
  compostWasteKg: number;
  recycleWasteKg: number;
  landfillWasteKg: number;
}

export interface StadiumIncident {
  id: string;
  category: "Safety" | "Operations" | "Medical" | "Sustainability" | "Crowd";
  section: string;
  description: string;
  reportedTime: string;
  status: "New" | "Dispatched" | "Resolved";
  severity: "Low" | "Medium" | "High" | "Critical";
  assignedStaff: string;
}

// Initial Static Data representing MetLife Stadium for FIFA World Cup 2026
export const METLIFE_STADIUM_INFO = {
  name: "MetLife Stadium",
  city: "East Rutherford, NJ/NY",
  capacity: 82500,
  currentAttendance: 74218,
  matchDescription: "FIFA World Cup 2026 - Semi-Final: Argentina vs. France",
  weather: "Clear, 72°F (22°C)",
  humidity: "48%",
  wind: "5 mph NW",
};

export const INITIAL_GATES: GateInfo[] = [
  { id: "gate-a", name: "MetLife Gate (Gate A)", status: "Open", queueTimeMin: 8, currentFlow: 120, capacity: 200, coordinate: { x: 50, y: 15 }, servedSections: [101, 102, 103, 104, 105, 149, 148, 147, 146, 201, 202, 301, 302] },
  { id: "gate-b", name: "Verizon Gate (Gate B)", status: "Open", queueTimeMin: 22, currentFlow: 180, capacity: 200, coordinate: { x: 85, y: 35 }, servedSections: [106, 107, 108, 109, 110, 111, 112, 113, 114, 206, 210, 308, 312] },
  { id: "gate-c", name: "HCLTech Gate (Gate C)", status: "Delayed", queueTimeMin: 45, currentFlow: 90, capacity: 200, coordinate: { x: 80, y: 70 }, servedSections: [115, 116, 117, 118, 119, 120, 121, 122, 123, 215, 220, 318, 322] },
  { id: "gate-d", name: "Bud Light Gate (Gate D)", status: "Open", queueTimeMin: 12, currentFlow: 110, capacity: 200, coordinate: { x: 50, y: 88 }, servedSections: [124, 125, 126, 127, 128, 129, 130, 131, 132, 225, 230, 325, 330] },
  { id: "gate-e", name: "Pepsi Gate (Gate E)", status: "Open", queueTimeMin: 15, currentFlow: 130, capacity: 200, coordinate: { x: 15, y: 65 }, servedSections: [133, 134, 135, 136, 137, 138, 139, 140, 141, 235, 240, 335, 340] },
  { id: "gate-f", name: "Welch's Gate (Gate F)", status: "Closed", queueTimeMin: 0, currentFlow: 0, capacity: 200, coordinate: { x: 15, y: 35 }, servedSections: [142, 143, 144, 145, 146, 245, 345] }
];

export const INITIAL_CONCESSIONS: ConcessionStand[] = [
  { id: "con-1", name: "Global Street Eats", type: "Food", status: "Active", queueTimeMin: 5, featuredItem: "Vegan Empanadas & Arepas", isEcoFriendly: true, location: "Sec 114", coordinate: { x: 74, y: 30 } },
  { id: "con-2", name: "Jersey Grill", type: "Food", status: "Busy", queueTimeMin: 18, featuredItem: "Steak Sandwiches & Fries", isEcoFriendly: false, location: "Sec 128", coordinate: { x: 42, y: 76 } },
  { id: "con-3", name: "EcoHydrate Station", type: "Beverage", status: "Active", queueTimeMin: 2, featuredItem: "Filtered Water & Organic Juices", isEcoFriendly: true, location: "Sec 103", coordinate: { x: 58, y: 22 } },
  { id: "con-4", name: "Copa Merch Hub", type: "Merchandise", status: "Busy", queueTimeMin: 25, featuredItem: "Official FIFA 2026 Match Scarves", isEcoFriendly: true, location: "Sec 140", coordinate: { x: 26, y: 55 } },
  { id: "con-5", name: "Verde Snacks", type: "Food", status: "Active", queueTimeMin: 7, featuredItem: "Plant-based Burgers & Wraps", isEcoFriendly: true, location: "Sec 148", coordinate: { x: 34, y: 25 } },
  { id: "con-6", name: "Brews & Goals", type: "Beverage", status: "Active", queueTimeMin: 12, featuredItem: "Local Craft Draft & Soft Drinks", isEcoFriendly: false, location: "Sec 122", coordinate: { x: 72, y: 62 } },
];

export const INITIAL_PARKING: ParkingInfo[] = [
  { id: "park-gold", name: "Gold Lot (A, B, C)", occupancyPercent: 88, status: "Filling Fast", shuttleFrequencyMin: 5, accessibilitySpacesFree: 14 },
  { id: "park-silver", name: "Silver Lot (D, E, F)", occupancyPercent: 94, status: "Filling Fast", shuttleFrequencyMin: 8, accessibilitySpacesFree: 3 },
  { id: "park-economy", name: "Economy Park & Ride (Lot P1)", occupancyPercent: 62, status: "Available", shuttleFrequencyMin: 12, accessibilitySpacesFree: 45 },
  { id: "park-vip", name: "VIP Preferred Lot", occupancyPercent: 100, status: "Full", shuttleFrequencyMin: 3, accessibilitySpacesFree: 0 },
];

export const INITIAL_TRANSIT: TransitRoute[] = [
  { id: "transit-train", type: "Train", name: "NJ Transit Meadowlands Rail", destination: "Secaucus Junction / NY Penn Station", status: "Normal", statusMessage: "Trains operating on 10-minute intervals post-match.", nextDepartureMin: 6 },
  { id: "transit-bus", type: "Bus", name: "FIFA Express Shuttle Bus 351", destination: "Port Authority Bus Terminal, NYC", status: "Normal", statusMessage: "Express bus loading at Lot G.", nextDepartureMin: 4 },
  { id: "transit-ride", type: "Rideshare", name: "Uber/Lyft Dedicated Zone", destination: "MetLife Lot G Rideshare Hub", status: "Delayed", statusMessage: "High surge volume. Wait times approximately 30 mins.", nextDepartureMin: 15 },
  { id: "transit-shuttle", type: "Shuttle", name: "ADA Accessible Venue Shuttle", destination: "All Lots & Ticket Gates", status: "Normal", statusMessage: "Priority boarding for wheelchair users and seniors.", nextDepartureMin: 3 }
];

export const INITIAL_SUSTAINABILITY: SustainabilityMetrics = {
  energyRenewablePercent: 84,
  powerConsumptionKw: 1420,
  waterSavedGallons: 42500,
  compostWasteKg: 1250,
  recycleWasteKg: 3100,
  landfillWasteKg: 450,
};

export const INITIAL_INCIDENTS: StadiumIncident[] = [
  {
    id: "inc-101",
    category: "Safety",
    section: "Gate C Entrance",
    description: "Ticket scanner hardware fault causing backup in lanes 3 and 4.",
    reportedTime: "14:15",
    status: "Dispatched",
    severity: "High",
    assignedStaff: "Tech Support Team B + Volunteer Coord Unit 3",
  },
  {
    id: "inc-102",
    category: "Medical",
    section: "Section 124, Row 12",
    description: "Spectator feeling dizzy due to heat. Medical response unit requested.",
    reportedTime: "14:40",
    status: "Resolved",
    severity: "Medium",
    assignedStaff: "First Aid Station 4 (Paramedic Sarah & Volunteer Bob)",
  },
  {
    id: "inc-103",
    category: "Sustainability",
    section: "Concession Area Sec 128",
    description: "Recycle bins overflowing with plastic bottles. Trash sorting volunteer team needed.",
    reportedTime: "14:48",
    status: "New",
    severity: "Low",
    assignedStaff: "Eco-Squad Volunteers (Pending Dispatch)",
  }
];

// Helper Functions for Fan Seat Routing & Navigation
export function getRouteForSection(
  sectionNumber: number,
  gatesList: GateInfo[] = INITIAL_GATES,
  concessionsList: ConcessionStand[] = INITIAL_CONCESSIONS
): {
  optimalGate: GateInfo;
  secondaryGate: GateInfo;
  closestConcessions: ConcessionStand[];
  accessibilityNotes: string;
} {
  // Find gates serving this section
  let optimalGate = gatesList[0];
  let secondaryGate = gatesList[1];
  
  // Simple heuristic based on section proximity
  const gateMatches = gatesList.filter(g => g.servedSections.includes(sectionNumber));
  
  if (gateMatches.length > 0) {
    // Sort gates by queue time to find the fastest
    const sortedByTime = [...gateMatches].sort((a, b) => a.queueTimeMin - b.queueTimeMin);
    optimalGate = sortedByTime[0];
    secondaryGate = sortedByTime[1] || gatesList.find(g => g.id !== optimalGate.id)!;
  }

  // Find concessions sorted by proximity
  // For demo, we just return all active concessions, prioritizing eco-friendly ones first
  const sortedConcessions = [...concessionsList]
    .filter(c => c.status !== "Inactive")
    .sort((a, b) => {
      // Eco friendly concessions first, then by queue time
      if (a.isEcoFriendly && !b.isEcoFriendly) return -1;
      if (!a.isEcoFriendly && b.isEcoFriendly) return 1;
      return a.queueTimeMin - b.queueTimeMin;
    });

  // General Accessibility details based on section tier
  let accessibilityNotes = "Standard step-free elevator access is located nearby. Elevators operate at Sections 104, 124, 143, and 224.";
  if (sectionNumber >= 300) {
    accessibilityNotes = "Escalators are available from the plaza level. Companion seating and wheelchair seating are located in Row 1 of the 300 level sections. Sensory bags can be requested at Guest Services Sec 124.";
  } else if (sectionNumber >= 200) {
    accessibilityNotes = "Level entry from the mezzanine concourse. Wheelchair access is available via ramps at West and East Plazas. Family restrooms are adjacent to Section 207.";
  }

  return {
    optimalGate,
    secondaryGate,
    closestConcessions: sortedConcessions.slice(0, 3),
    accessibilityNotes
  };
}

// MetLife Stadium Knowledge Base for GenAI Multilingual Companion
export const KNOWLEDGE_BASE: Record<string, string[]> = {
  accessibility: [
    "MetLife Stadium is fully ADA compliant, with accessible parking, companion seating, elevators, and ramps.",
    "Sensory bags (noise-canceling headphones, fidget tools) are available for free at Guest Services booths located at Sections 124 and 315.",
    "Closed captioning devices can be checked out at Guest Services. High-contrast assistive devices are also available.",
    "Accessible restrooms are located in all levels of the stadium. Look for the blue universal symbol."
  ],
  transportation: [
    "NJ Transit Train: The Meadowlands Rail Line connects Secaucus Junction directly to the stadium. Train shuttle schedules run continuously post-match.",
    "FIFA Bus Express: Line 351 runs directly to Port Authority Bus Terminal in New York City from Lot G.",
    "Rideshare (Uber/Lyft): Pick-up and drop-off are strictly located in Lot G. Do not attempt pickup outside of Lot G due to road closures.",
    "Parking: Gold, Silver, and Economy lots are open. Prepaid passes are required. All lots feature ADA accessible shuttle service to the gates."
  ],
  sustainability: [
    "MetLife Stadium aims for zero waste. Recycle plastics/aluminum in green bins, organic food waste in brown compost bins, and all other waste in black bins.",
    "All concession vendors use 100% compostable cups, plates, and utensils.",
    "Water stations are available for refill. Bring a clean, empty reusable plastic bottle under 20 oz. Metal containers are strictly prohibited.",
    "Solar rings around the stadium canopy produce clean renewable energy that powers the stadium scoreboards and LED lights."
  ],
  safety: [
    "Banned items: Professional cameras (lenses > 6 inches), video cameras, laptops, backpacks, large bags, metal cups, flags or banners larger than 3ft x 2ft.",
    "Clear Bag Policy: Only clear bags (plastic, vinyl, or PVC) not exceeding 12\" x 6\" x 12\" are allowed, or small clutch purses under 4.5\" x 6.5\".",
    "In case of emergency, follow instructions on stadium video screens and obey venue stewards in neon yellow vests."
  ],
  tickets: [
    "All FIFA World Cup 2026 tickets are digital-only via the FIFA Ticketing App. Screenshot tickets are not valid for gate scanners.",
    "Ticket resolution centers are located at the ticketing booths next to Gate A and Gate D."
  ]
};
