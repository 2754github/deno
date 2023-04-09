import { Request } from 'https://deno.land/x/oak@v12.1.0/mod.ts';
import { OpenAI } from 'https://deno.land/x/openai@1.3.0/mod.ts';
import { Client, WebhookEvent, validateSignature } from 'https://esm.sh/@line/bot-sdk@7.5.2';
import { env } from '../../env.ts';

export const jarvisValidate = async (req: Request) => {
  // https://developers.line.biz/ja/reference/messaging-api/#signature-validation
  const signature = req.headers.get('x-line-signature');
  if (!signature) return false;

  // https://line.github.io/line-bot-sdk-nodejs/api-reference/validate-signature.html
  return validateSignature(await req.body({ type: 'text' }).value, env.line.jarvis.channelSecret, signature);
};

const line = new Client(env.line.jarvis);
const openai = new OpenAI(env.openai.apiKey);

export const jarvisHandler = async (event: WebhookEvent) => {
  // アクセスログ
  const user = await line.getProfile(event.source.userId ?? '');
  await notify(`ID: ${user.userId}\nName: ${user.displayName}`);

  // バリデーション
  if (event.type !== 'message') return notify('non-message event');
  if (event.message.type !== 'text') {
    return line.replyMessage(event.replyToken, {
      type: 'text',
      text: 'テキストメッセージのみをサポートしています 🙇‍♂️',
    });
  }

  await notify(`Message:\n${event.message.text}`);

  // 画像生成モード
  if (event.message.text.startsWith('画像生成\n')) {
    try {
      const res = await openai.createImage({ prompt: event.message.text.substring(5) });
      return line.replyMessage(event.replyToken, {
        type: 'image',
        originalContentUrl: res.data.at(0)?.url ?? '',
        previewImageUrl: res.data.at(0)?.url ?? '',
      });
    } catch (e) {
      return notify(JSON.stringify(e));
    }
  }

  // 通常会話モード
  try {
    const messages = cache.get(user.userId) ?? [];
    messages.push({ role: 'user', content: event.message.text });

    const res = await openai.createChatCompletion({ model: 'gpt-3.5-turbo', messages });
    messages.push(res.choices[0].message);

    cache.set(user.userId, messages.slice(-20)); // 直近20件までの会話内容を保持

    return line.replyMessage(event.replyToken, {
      type: 'text',
      text: `> ${event.message.text}\n\n${
        res.choices.at(0)?.message.content ?? 'エラーが発生しました 😢\nもう一度、お試しください 🙇‍♂️'
      }`,
    });
  } catch (e) {
    return notify(JSON.stringify(e));
  }
};

// https://notify-bot.line.me/doc/ja/
const notify = async (message: string) => {
  try {
    const formData = new FormData();
    formData.append('message', '\n' + message);
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.line.notifyAccessToken}`,
      },
      body: formData,
    });
  } catch {
    console.error(message);
  }
};

/**
 * Key: userId
 * Value: messages
 */
const cache = new Map<string, { role: string; content: string }[]>();
