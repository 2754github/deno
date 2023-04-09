export const env = {
  line: {
    jarvis: {
      channelAccessToken: Deno.env.get('LINE_JARVIS_CHANNEL_ACCESS_TOKEN') ?? '',
      channelSecret: Deno.env.get('LINE_JARVIS_CHANNEL_SECRET') ?? '',
    },
    notifyAccessToken: Deno.env.get('LINE_NOTIFY_ACCESS_TOKEN') ?? '',
  },
  openai: {
    apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
  },
} as const;
