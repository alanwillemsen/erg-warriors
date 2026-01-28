/**
 * Check if a Discord user is a member of a specific server
 */
export async function isUserInServer(
  userId: string,
  accessToken: string,
  serverId: string
): Promise<boolean> {
  try {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch Discord guilds:", response.statusText);
      return false;
    }

    const guilds = await response.json();

    // Check if the user is in the configured server
    return guilds.some((guild: any) => guild.id === serverId);
  } catch (error) {
    console.error("Error checking Discord server membership:", error);
    return false;
  }
}

/**
 * Get Discord user information
 */
export async function getDiscordUser(accessToken: string) {
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Discord user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Discord user:", error);
    throw error;
  }
}
