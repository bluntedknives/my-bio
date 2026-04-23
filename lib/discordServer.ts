type LanyardResponse = {
  success?: boolean;
  data?: {
    discord_status?: string;
    discord_user?: {
      id: string;
      username: string;
      global_name?: string | null;
      avatar?: string | null;
    };
  };
};

const FALLBACK_DISCORD_USER_ID = "1462897238559822044";

export const getDiscordUserId = () => {
  return process.env.DISCORD_USER_ID || process.env.NEXT_PUBLIC_DISCORD_USER_ID || FALLBACK_DISCORD_USER_ID;
};

export const getDiscordProfileUrl = () => {
  return `https://discord.com/users/${getDiscordUserId()}`;
};

export const fetchDiscordPresence = async () => {
  const userId = getDiscordUserId();
  const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Lanyard request failed with ${response.status}`);
  }

  const payload = (await response.json()) as LanyardResponse;
  const user = payload?.data?.discord_user;
  const status = payload?.data?.discord_status ?? "offline";

  let avatarUrl = "";
  if (user?.avatar) {
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
  }

  return {
    userId,
    profileUrl: getDiscordProfileUrl(),
    status,
    username: user?.username ?? "",
    displayName: (user?.global_name || user?.username || "").trim(),
    avatarUrl,
  };
};
