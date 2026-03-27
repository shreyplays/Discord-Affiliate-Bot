const { Client, GatewayIntentBits } = require("discord.js");

// ============================================================
//  EDIT THESE TWO VALUES — nothing else needs to change!
// ============================================================
// ============================================================
//  STEP 1: Paste your NEW bot token below (between the quotes)
//          Get it from: discord.com/developers/applications
//          → Your App → Bot → Reset Token → Copy
// ============================================================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// ✅ Your affiliate tag is already set — no changes needed here
const AFFILIATE_TAG = "shrey13-21";
// ============================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Matches amazon.in, amazon.com, amzn.to, amzn.in short links
const AMAZON_REGEX =
  /https?:\/\/(www\.)?(amazon\.(in|com|co\.uk)|amzn\.(to|in))\/[\w\-\/\?=&%\.#@!~]+/gi;

function addAffiliateTag(url) {
  try {
    // Expand short links like amzn.to — we just append tag and let Amazon redirect
    const parsed = new URL(url);

    // Remove any existing affiliate/associate tag so ours takes over
    parsed.searchParams.delete("tag");
    parsed.searchParams.delete("linkCode");
    parsed.searchParams.delete("linkId");

    // Add your tag
    parsed.searchParams.set("tag", AFFILIATE_TAG);

    return parsed.toString();
  } catch {
    // If URL parsing fails, just append tag manually
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tag=${AFFILIATE_TAG}`;
  }
}

client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // Ignore messages from bots (including itself)
  if (message.author.bot) return;

  const content = message.content;
  const matches = content.match(AMAZON_REGEX);

  if (!matches) return; // No Amazon link found, do nothing

  // Build affiliate versions of all found links
  const affiliateLinks = matches.map((url) => addAffiliateTag(url));

  // Build reply message
  const linkList = affiliateLinks
    .map((link, i) => `**Link ${i + 1}:** ${link}`)
    .join("\n");

  const reply =
    matches.length === 1
      ? `🛒 Here's the affiliate link for this product:\n${affiliateLinks[0]}`
      : `🛒 Here are the affiliate links for these products:\n${linkList}`;

  await message.reply(reply);
});

client.login(DISCORD_TOKEN);
