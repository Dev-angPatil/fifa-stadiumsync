import { KNOWLEDGE_BASE, GateInfo, ConcessionStand, TransitRoute, StadiumIncident } from "./stadiumData";

// Language keywords for multilingual support
const LANGUAGE_PROMPTS: Record<string, {
  detected: string;
  greeting: string;
  responsePrefix: string;
  fallback: string;
}> = {
  es: {
    detected: "Español (Spanish)",
    greeting: "¡Hola! Soy tu asistente de FIFA ArenaSync. ¿En qué puedo ayudarte hoy?",
    responsePrefix: "Según las guías del MetLife Stadium: ",
    fallback: "Disculpe, no tengo información exacta para esa pregunta, pero puede consultar con el personal de asistencia en la entrada de las puertas principales o en Servicio al Cliente en la Sección 124."
  },
  fr: {
    detected: "Français (French)",
    greeting: "Bonjour ! Je suis votre assistant FIFA ArenaSync. Comment puis-je vous aider aujourd'hui ?",
    responsePrefix: "Selon les directives du MetLife Stadium : ",
    fallback: "Désolé, je n'ai pas d'informations précises sur ce sujet. Veuillez contacter les stadiers aux portes d'entrée ou le service client à la Section 124."
  },
  pt: {
    detected: "Português (Portuguese)",
    greeting: "Olá! Sou o seu assistente FIFA ArenaSync. Como posso ajudar você hoje?",
    responsePrefix: "De acordo com as diretrizes do MetLife Stadium: ",
    fallback: "Desculpe, não tenho informações específicas sobre isso. Por favor, consulte os assistentes de portão ou o atendimento ao cliente na Seção 124."
  },
  ar: {
    detected: "العربية (Arabic)",
    greeting: "مرحباً! أنا مساعد FIFA ArenaSync الخاص بك. كيف يمكنني مساعدتك اليوم؟",
    responsePrefix: "وفقاً لإرشادات ملعب ميتلايف: ",
    fallback: "عذراً، ليس لدي معلومات دقيقة حول هذا الموضوع. يرجى مراجعة موظفي البوابة أو مكتب خدمات الضيوف في القسم 124."
  },
  de: {
    detected: "Deutsch (German)",
    greeting: "Hallo! Ich bin Ihr FIFA ArenaSync Assistent. Wie kann ich Ihnen heute helfen?",
    responsePrefix: "Gemäß den Richtlinien des MetLife Stadiums: ",
    fallback: "Entschuldigung, ich habe dazu keine genauen Informationen. Bitte wenden Sie sich an die Ordner an den Toren oder an den Gästeservice in Sektor 124."
  },
  en: {
    detected: "English",
    greeting: "Hello! I am your FIFA ArenaSync Companion. How can I help you navigate the match today?",
    responsePrefix: "According to MetLife Stadium guidelines: ",
    fallback: "I couldn't find specific official information on that topic. Please ask any stadium volunteer in a neon vest, or visit Guest Services at Section 124."
  }
};

// Simple Language Detector
function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("hola") || lowerText.includes("gracias") || lowerText.includes("estadio") || lowerText.includes("puerta") || lowerText.includes("baño") || lowerText.includes("seguridad") || lowerText.includes("transporte")) {
    return "es";
  }
  if (lowerText.includes("bonjour") || lowerText.includes("merci") || lowerText.includes("stade") || lowerText.includes("porte") || lowerText.includes("toilette") || lowerText.includes("sécurité")) {
    return "fr";
  }
  if (lowerText.includes("olá") || lowerText.includes("obrigado") || lowerText.includes("estádio") || lowerText.includes("banheiro") || lowerText.includes("portão")) {
    return "pt";
  }
  if (lowerText.includes("hallo") || lowerText.includes("danke") || lowerText.includes("stadion") || lowerText.includes("tor") || lowerText.includes("sicherheit")) {
    return "de";
  }
  if (lowerText.includes("مرحبا") || lowerText.includes("شكرا") || lowerText.includes("ملعب") || lowerText.includes("بوابة") || lowerText.includes("أمن") || lowerText.includes("مواصلات")) {
    return "ar";
  }
  
  return "en"; // Default to English
}

// Simulated GenAI Fan Chat Response
export async function getFanAIResponse(message: string): Promise<{
  text: string;
  detectedLanguage: string;
  suggestedAction?: { label: string; action: string };
}> {
  // Simulate network delay for realistic GenAI feel
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lang = detectLanguage(message);
  const config = LANGUAGE_PROMPTS[lang];
  const query = message.toLowerCase();

  let matchedCategory = "";
  let matchedPoints: string[] = [];

  // Match keywords against Knowledge Base categories
  if (query.includes("wheelchair") || query.includes("accessibility") || query.includes("disabled") || query.includes("sensory") || query.includes("blind") || query.includes("deaf") || query.includes("ada") || query.includes("rampa") || query.includes("ascensor") || query.includes("silla de ruedas") || query.includes("fauteuil roulant")) {
    matchedCategory = "accessibility";
    matchedPoints = KNOWLEDGE_BASE.accessibility;
  } else if (query.includes("bus") || query.includes("train") || query.includes("uber") || query.includes("lyft") || query.includes("rideshare") || query.includes("parking") || query.includes("lot") || query.includes("transit") || query.includes("subway") || query.includes("tren") || query.includes("estacionamiento") || query.includes("carro") || query.includes("taxi")) {
    matchedCategory = "transportation";
    matchedPoints = KNOWLEDGE_BASE.transportation;
  } else if (query.includes("recycle") || query.includes("sustainable") || query.includes("eco") || query.includes("green") || query.includes("compost") || query.includes("sustainability") || query.includes("water") || query.includes("plastic") || query.includes("basura") || query.includes("reciclar") || query.includes("biodegradable")) {
    matchedCategory = "sustainability";
    matchedPoints = KNOWLEDGE_BASE.sustainability;
  } else if (query.includes("bag") || query.includes("camera") || query.includes("clear bag") || query.includes("rules") || query.includes("forbidden") || query.includes("safety") || query.includes("emergency") || query.includes("security") || query.includes("prohibido") || query.includes("seguridad") || query.includes("mochila")) {
    matchedCategory = "safety";
    matchedPoints = KNOWLEDGE_BASE.safety;
  } else if (query.includes("ticket") || query.includes("app") || query.includes("ticketing") || query.includes("digital") || query.includes("screen") || query.includes("booth") || query.includes("boleto") || query.includes("entrada") || query.includes("billet")) {
    matchedCategory = "tickets";
    matchedPoints = KNOWLEDGE_BASE.tickets;
  }

  // If no category matched directly, check for general greetings
  if (matchedPoints.length === 0) {
    if (query.includes("hello") || query.includes("hi") || query.includes("hola") || query.includes("hey") || query.includes("bonjour") || query.includes("olá") || query.includes("مرحبا")) {
      return {
        text: config.greeting,
        detectedLanguage: config.detected
      };
    }
  }

  // Translate responses roughly into target languages for realism
  if (matchedPoints.length > 0) {
    // Generate responses based on category and language
    let responseText = config.responsePrefix + "\n\n";
    
    // Choose 2 primary points
    const points = matchedPoints.slice(0, 2);
    
    if (lang === "es") {
      points.forEach((p) => {
        if (p.includes("ADA")) responseText += "• El estadio cumple con las normas de accesibilidad ADA. Sillas de ruedas y asientos para acompañantes están disponibles en todos los niveles.\n";
        else if (p.includes("Sensory bags")) responseText += "• Las bolsas sensoriales con auriculares que cancelan el ruido se pueden solicitar en los Centros de Servicio al Cliente en la Secc. 124.\n";
        else if (p.includes("NJ Transit")) responseText += "• NJ Transit opera trenes desde Secaucus Junction directamente al estadio de manera continua.\n";
        else if (p.includes("Lot G")) responseText += "• Uber/Lyft y taxis operan exclusivamente desde el Lote G. Siga los letreros luminosos.\n";
        else if (p.includes("zero waste")) responseText += "• Clasifique los residuos: contenedores verdes para reciclaje, marrones para compostaje de alimentos, y negros para basura común.\n";
        else if (p.includes("compostable")) responseText += "• Los vasos y utensilios en todas las concesiones son 100% compostables.\n";
        else if (p.includes("Clear Bag Policy")) responseText += "• Política de Bolsas Transparentes: Solo se permiten bolsos transparentes menores de 12x6x12 pulgadas.\n";
        else if (p.includes("Ticketing")) responseText += "• Los boletos son 100% digitales en la app de la FIFA. No se aceptan capturas de pantalla.\n";
        else responseText += `• ${p}\n`;
      });
      return {
        text: responseText + "\n¿Tiene alguna otra duda sobre el MetLife Stadium?",
        detectedLanguage: config.detected,
        suggestedAction: matchedCategory === "transportation" ? { label: "Ver Transporte", action: "transportation" } : undefined
      };
    }
    
    if (lang === "fr") {
      points.forEach((p) => {
        if (p.includes("ADA")) responseText += "• Le stade est entièrement accessible. Des sièges pour fauteuils roulants sont disponibles à tous les niveaux.\n";
        else if (p.includes("Sensory bags")) responseText += "• Des kits sensoriels (casques antibruit) sont disponibles gratuitement au Service Client (Section 124).\n";
        else if (p.includes("NJ Transit")) responseText += "• Navettes ferroviaires NJ Transit directes depuis la gare de Secaucus Junction.\n";
        else if (p.includes("Lot G")) responseText += "• Les zones de covoiturage (Uber/Lyft) se trouvent uniquement au Parking Lot G.\n";
        else if (p.includes("zero waste")) responseText += "• Triez vos déchets : bacs verts pour le recyclage, bacs marrons pour le compost.\n";
        else if (p.includes("Clear Bag Policy")) responseText += "• Sacs transparents uniquement. Dimensions maximales autorisées : 30 x 15 x 30 cm.\n";
        else responseText += `• ${p}\n`;
      });
      return {
        text: responseText + "\nPuis-je vous aider pour autre chose ?",
        detectedLanguage: config.detected,
        suggestedAction: matchedCategory === "accessibility" ? { label: "Itinéraire accessible", action: "accessibility" } : undefined
      };
    }

    // Default to English response
    points.forEach((p) => {
      responseText += `• ${p}\n`;
    });
    
    return {
      text: responseText + "\nDo you need any additional assistance regarding this matter?",
      detectedLanguage: config.detected,
      suggestedAction: matchedCategory === "transportation" 
        ? { label: "Open Transit Planner", action: "transportation" } 
        : matchedCategory === "accessibility" 
          ? { label: "Check Accessibility Routes", action: "accessibility" } 
          : undefined
    };
  }

  // Fallback response
  return {
    text: config.fallback,
    detectedLanguage: config.detected
  };
}

// Simulated Ops Command Center AI Decision Advisor
export async function getOpsAIAdvice(
  gates: GateInfo[],
  concessions: ConcessionStand[],
  transits: TransitRoute[],
  incidents: StadiumIncident[]
): Promise<{
  alerts: string[];
  recommendations: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    impactArea: string;
    suggestedAction: string;
  }[];
}> {
  interface Recommendation {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    impactArea: string;
    suggestedAction: string;
  }
  const alerts: string[] = [];
  const recommendations: Recommendation[] = [];

  // Check for slow gate queues
  const slowGates = gates.filter((g) => g.status === "Open" && g.queueTimeMin >= 20);
  if (slowGates.length > 0) {
    slowGates.forEach((gate) => {
      alerts.push(`High congestion detected at ${gate.name} (${gate.queueTimeMin} min wait).`);
      
      // Look for a nearby gate serving similar sections with low queue time
      const nearbyAlternative = gates.find(
        (g) => g.id !== gate.id && g.status === "Open" && g.queueTimeMin < 15
      );
      
      recommendations.push({
        title: `Reroute Crowd from ${gate.name}`,
        description: `${gate.name} is experiencing elevated queues. Dynamic fan signage should route newly arriving spectators towards ${nearbyAlternative ? nearbyAlternative.name : "other gates"}.`,
        priority: gate.queueTimeMin > 30 ? "High" : "Medium",
        impactArea: "Gate Entry & Crowd Flow",
        suggestedAction: nearbyAlternative 
          ? `Adjust Fan App dynamic route suggestion to prioritize ${nearbyAlternative.name}. Send push notification to fans within 500m of stadium.`
          : "Activate backup ticket lanes and redirect staff from administrative desks to gate scanners."
      });
    });
  }

  // Check for delayed gate status
  const delayedGates = gates.filter((g) => g.status === "Delayed");
  if (delayedGates.length > 0) {
    delayedGates.forEach((gate) => {
      alerts.push(`CRITICAL: ${gate.name} is operating in DELAYED status.`);
      recommendations.push({
        title: `Emergency Staffing at ${gate.name}`,
        description: `Operations at ${gate.name} are bottlenecked. A hardware or scanner system issue is likely.`,
        priority: "Critical",
        impactArea: "Stadium Gates",
        suggestedAction: "Dispatch Tech Support Unit 2 immediately. Relocate 5 volunteer guides from Central Concourse to the gate entry plaza to manage queue lines manually and distribute water bottles."
      });
    });
  }

  // Check for active incidents
  const unresolvedIncidents = incidents.filter((i) => i.status !== "Resolved");
  if (unresolvedIncidents.length > 0) {
    unresolvedIncidents.forEach((inc) => {
      const isHighSeverity = inc.severity === "High" || inc.severity === "Critical";
      
      if (isHighSeverity) {
        alerts.push(`CRITICAL INCIDENT: ${inc.category} alert at ${inc.section}.`);
      }
      
      if (inc.category === "Safety" && inc.status !== "Resolved") {
        recommendations.push({
          title: `Resolve Safety Fault at ${inc.section}`,
          description: `Active incident "${inc.description}" is impeding spectator flow.`,
          priority: isHighSeverity ? "High" : "Medium",
          impactArea: "Stadium Safety",
          suggestedAction: `Validate backup scanner units. Deploy Volunteer Crowd Marshalls to Section ${inc.section} to manually coordinate lines and prevent blockages while technicians solve the hardware issue.`
        });
      } else if (inc.category === "Sustainability" && inc.status === "New") {
        recommendations.push({
          title: `Deploy Waste-Sorting Team`,
          description: `Reports of recycling bin overflow at ${inc.section} violate zero-waste FIFA standards.`,
          priority: "Low",
          impactArea: "Sustainability",
          suggestedAction: "Assign Eco-Squad volunteer team (Unit Green) to clear the bins and inspect sorting compliance. Ensure compost bags are redirected to the waste compactor."
        });
      } else if (inc.category === "Medical" && inc.status !== "Resolved") {
        recommendations.push({
          title: `Monitor Medical Dispatch`,
          description: `Medical event reported at ${inc.section} requires secure corridor.`,
          priority: "Critical",
          impactArea: "Medical Response",
          suggestedAction: "Ensure Zone 3 security clears emergency access path. Volunteers at Section gate must keep stairways clear of standing spectators."
        });
      }
    });
  }

  // Check for delayed public transits
  const delayedTransit = transits.filter((t) => t.status === "Delayed");
  if (delayedTransit.length > 0) {
    delayedTransit.forEach((transit) => {
      alerts.push(`Transit Delay: ${transit.name} is experiencing delays.`);
      recommendations.push({
        title: `Transit Congestion Mitigation`,
        description: `Delays in ${transit.name} (${transit.statusMessage}) will cause fans to linger inside the stadium plazas post-match.`,
        priority: "Medium",
        impactArea: "Public Transportation",
        suggestedAction: "Instruct stadium concession stands and official merch shops to remain active for an extra 20 minutes post-match to distribute crowd egress. Update the Fan App schedule to recommend train or bus alternatives."
      });
    });
  }

  // Default recommendations if everything is smooth
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Routine Operations Optimization",
      description: "All gates, concessions, and transit systems are performing within standard thresholds.",
      priority: "Low",
      impactArea: "General Venue Operations",
      suggestedAction: "Continue monitoring sensor feeds. Keep volunteer crews stationed at high-traffic crossing hubs to maintain steady crowd dispersion."
    });
  }

  return {
    alerts,
    recommendations
  };
}
