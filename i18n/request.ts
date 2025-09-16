import { getRequestConfig } from "next-intl/server";

const FALLBACK_LOCALE = process.env.DEFAULT_LOCALE ?? "en";

export default getRequestConfig(async ({ locale }) => {
  const localeToUse = locale ?? FALLBACK_LOCALE;
  const messagesModule = await import(`./messages/${localeToUse}.json`).catch(() =>
    import(`./messages/${FALLBACK_LOCALE}.json`),
  );

  return {
    locale: localeToUse,
    messages: messagesModule.default,
  };
});
