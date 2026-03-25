This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ota-onalar Uchun Telegram Bot Yo'riqnomasi

Loyiha (IQRO) uchun telegram bot yaratish va ulash uchun quyidagi qadamlarni bajaring:

1. **BotFather** orqali yangi bot yarating (Masalan: `@IqroOtaOnaBot`).
2. Botning **API xavfsizlik tokenini** (Token) nusxalang.
3. Yangi tokenni `.env.local` ichidagi `TELEGRAM_BOT_TOKEN=...` qatoriga qo'ying.
4. **Vercel** dagi loyiha sahifasiga o'ting: Settings -> Environment Variables. U yerda ham `TELEGRAM_BOT_TOKEN` o'zgaruvchisini kiritib, loyihani qayta (redeploy) build qiling.
5. Bot uchun Webhook o'rnating. Uning uchun brauzerda quyidagi manzilga kiring (loyihangiz server domeniga moslab):
   `https://api.telegram.org/bot<SIZNING_TOKENINGIZ>/setWebhook?url=https://<LOIYHA_DOMENI>/api/telegram`

**QAYD:** `TELEGRAM_BOT_TOKEN` kod ichida umuman yozilmagan. U faqat `process.env.TELEGRAM_BOT_TOKEN` orqali chaqiriladi, xavfsizlik uchun hech qayerda qattiq kod (hardcode) qilinmagan. Shuning uchun tokenni to'liq server / local environment o'zgaruvchilari orqali boshqaring!
