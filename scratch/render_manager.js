const fs = require("fs");
const path = require("path");

// Simple helper to load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!RENDER_API_KEY) {
  console.error("❌ ERROR: RENDER_API_KEY is not defined in .env.local.");
  console.log("\nPlease configure it by running the following command in your terminal:\n");
  console.log('printf "Enter RENDER_API_KEY (typing hidden): " && read -s val && echo && echo "RENDER_API_KEY=$val" >> "/home/deu/Coding Repos/fifastadiumsync/.env.local" && echo "Saved."');
  process.exit(1);
}

const headers = {
  accept: "application/json",
  authorization: `Bearer ${RENDER_API_KEY}`,
  "content-type": "application/json",
};

async function run() {
  try {
    console.log("🔍 Querying Render services...");
    const servicesRes = await fetch("https://api.render.com/v1/services?limit=100", { headers });
    if (!servicesRes.ok) {
      throw new Error(`Failed to list services: ${servicesRes.status} ${await servicesRes.text()}`);
    }
    const services = await servicesRes.json();
    
    console.log(`📋 Found ${services.length} services on Render.`);
    
    let currentService = null;
    
    for (const s of services) {
      const service = s.service;
      const isTarget = service.name.toLowerCase().includes("stadiumsync") || service.name.toLowerCase().includes("fifa");
      
      console.log(`- Service: ${service.name} | ID: ${service.id} | Type: ${service.type} | Status: ${service.status}`);
      
      if (isTarget) {
        currentService = service;
      } else {
        // Suspend other active services
        if (service.status !== "suspended") {
          console.log(`⏳ Suspending service: ${service.name} (${service.id})...`);
          const suspendRes = await fetch(`https://api.render.com/v1/services/${service.id}/suspend`, {
            method: "POST",
            headers
          });
          if (suspendRes.ok) {
            console.log(`✅ Suspended: ${service.name}`);
          } else {
            console.error(`❌ Failed to suspend ${service.name}: ${suspendRes.status} ${await suspendRes.text()}`);
          }
        } else {
          console.log(`ℹ️ Already suspended: ${service.name}`);
        }
      }
    }

    if (currentService) {
      console.log(`🎯 Found existing service for FIFA StadiumSync: ${currentService.name} (${currentService.id})`);
      
      // If suspended, resume it
      if (currentService.status === "suspended") {
        console.log(`⏳ Resuming FIFA StadiumSync...`);
        const resumeRes = await fetch(`https://api.render.com/v1/services/${currentService.id}/resume`, {
          method: "POST",
          headers
        });
        if (resumeRes.ok) {
          console.log("✅ Resumed FIFA StadiumSync service.");
        } else {
          console.error(`❌ Failed to resume: ${resumeRes.status} ${await resumeRes.text()}`);
        }
      }
      
      // Trigger a new deployment
      console.log("🚀 Triggering a new manual deployment for FIFA StadiumSync...");
      const deployRes = await fetch(`https://api.render.com/v1/services/${currentService.id}/deploys`, {
        method: "POST",
        headers,
        body: JSON.stringify({ clearCache: "do_not_clear" })
      });
      if (deployRes.ok) {
        const deployData = await deployRes.json();
        console.log(`✅ Deployment triggered successfully! Deploy ID: ${deployData.id}`);
      } else {
        console.error(`❌ Failed to trigger deploy: ${deployRes.status} ${await deployRes.text()}`);
      }
      
    } else {
      console.log("ℹ️ No existing service for FIFA StadiumSync found. Creating a new Web Service...");
      
      // Find owners / Workspace ID
      const ownersRes = await fetch("https://api.render.com/v1/owners?limit=20", { headers });
      if (!ownersRes.ok) {
        throw new Error(`Failed to fetch account owners: ${ownersRes.status} ${await ownersRes.text()}`);
      }
      const owners = await ownersRes.json();
      if (owners.length === 0) {
        throw new Error("No owners found for your Render account.");
      }
      
      const ownerId = owners[0].owner.id;
      console.log(`👤 Using Render Owner ID: ${ownerId} (${owners[0].owner.name})`);
      
      // Create new service config
      const serviceConfig = {
        type: "web_service",
        name: "fifa-stadiumsync",
        ownerId: ownerId,
        repo: "https://github.com/Dev-angPatil/fifa-stadiumsync.git",
        branch: "main",
        rootDir: "",
        autoDeploy: "yes",
        serviceDetails: {
          runtime: "node",
          plan: "free", // Let's default to free tier to save costs
          envSpecificDetails: {
            buildCommand: "npm install && npm run build",
            startCommand: "npm run start"
          }
        },
        envVars: []
      };

      if (GEMINI_API_KEY) {
        serviceConfig.envVars.push({
          key: "GEMINI_API_KEY",
          value: GEMINI_API_KEY
        });
      }

      console.log("⏳ Creating new Web Service on Render...");
      const createRes = await fetch("https://api.render.com/v1/services", {
        method: "POST",
        headers,
        body: JSON.stringify(serviceConfig)
      });

      if (createRes.ok) {
        const newService = await createRes.json();
        console.log(`✅ Web Service created successfully!`);
        console.log(`🔗 Name: ${newService.service.name}`);
        console.log(`🔗 URL: ${newService.service.url}`);
        console.log(`🔗 ID: ${newService.service.id}`);
      } else {
        console.error(`❌ Failed to create service: ${createRes.status} ${await createRes.text()}`);
        console.log("\nIf the creation failed because 'free' plan is not available, trying on the 'starter' tier...");
        
        serviceConfig.serviceDetails.plan = "starter";
        const retryRes = await fetch("https://api.render.com/v1/services", {
          method: "POST",
          headers,
          body: JSON.stringify(serviceConfig)
        });
        
        if (retryRes.ok) {
          const newService = await retryRes.json();
          console.log(`✅ Web Service created successfully on free tier!`);
          console.log(`🔗 Name: ${newService.service.name}`);
          console.log(`🔗 URL: ${newService.service.url}`);
        } else {
          console.error(`❌ Retry failed: ${retryRes.status} ${await retryRes.text()}`);
        }
      }
    }
  } catch (error) {
    console.error("💥 Execution failed:", error.message);
  }
}

run();
