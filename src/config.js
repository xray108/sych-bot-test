const packageInfo = require('../package.json');
require('dotenv').config();

function requireEnv(name, hint = '') {
  const value = process.env[name];

  if (!value) {
    const suffix = hint ? ` (${hint})` : '';
    throw new Error(`[CONFIG] Отсутствует переменная окружения ${name}${suffix}`);
  }

  return value;
}

function collectGeminiKeys() {
  const keys = [];

  const primaryKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (primaryKey) keys.push(primaryKey);

  let i = 2;
  while (process.env[`GOOGLE_GEMINI_API_KEY_${i}`]) {
    keys.push(process.env[`GOOGLE_GEMINI_API_KEY_${i}`]);
    i++;
  }

  return keys;
}

const geminiKeys = collectGeminiKeys();
console.log(`[CONFIG] Загружено ключей Gemini: ${geminiKeys.length}`);

const telegramToken = requireEnv('TELEGRAM_BOT_TOKEN', 'формат 0000000:abc');
const adminIdRaw = requireEnv('ADMIN_USER_ID', 'цифровой ID администратора');

const webhookBaseUrl = requireEnv('WEBHOOK_BASE_URL', 'публичный https URL без слеша в конце');
const port = Number.parseInt(process.env.PORT || '3000', 10);
const webhookPath = `/bot${telegramToken}`;

const botId = Number.parseInt(telegramToken.split(':')[0], 10);
const adminId = Number.parseInt(adminIdRaw, 10);

if (Number.isNaN(botId)) {
  throw new Error('[CONFIG] Не удалось извлечь botId из TELEGRAM_BOT_TOKEN');
}

if (Number.isNaN(adminId)) {
  throw new Error('[CONFIG] ADMIN_USER_ID должен быть числом');
}

if (Number.isNaN(port)) {
  throw new Error('[CONFIG] PORT должен быть числом');
}

module.exports = {
  telegramToken,
  version: packageInfo.version,
  botId,
  adminId,

  webhookBaseUrl,
  webhookPath,
  port,

  geminiKeys,

  modelName: 'gemini-2.5-flash',
  fallbackModelName: 'gemini-2.5-flash-lite', // Запасной вариант
  logicModelName: 'gemma-3-27b-it', // Рабочая лошадка для логики
  contextSize: 30,
  triggerRegex: /(?<![а-яёa-z])(сыч|sych)(?![а-яёa-z])/i,
};