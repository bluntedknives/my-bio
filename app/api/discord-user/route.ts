import { fetchDiscordPresence, getDiscordProfileUrl, getDiscordUserId } from "../../../lib/discordServer";

export async function GET(): Promise<Response> {
  try {
    const data = await fetchDiscordPresence();
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      {
        userId: getDiscordUserId(),
        profileUrl: getDiscordProfileUrl(),
        status: "offline",
        username: "",
        displayName: "",
        avatarUrl: "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
