import get from "lodash/get";
import {useCallback, useRef, useEffect} from "reactn";
import {useRouter} from "next/router";
import {Switch} from "../components/form";

import en from "../../public/locales/en.json";
import es from "../../public/locales/es.json";
import isEmpty from "lodash/isEmpty";

// TODO: Consider chunk the json files.
const TRANSLATIONS = {
  en: { ...en },
  es: { ...es },
};

// TODO: Support capitalize.
export const useTranslation = (path) => {
  const router = useRouter();
  const { locale, asPath, pathname } = router;

  // Current languages.
  const locales = Object.keys(TRANSLATIONS);

  // Update language and redirect.
  const setLocale = useCallback(
    (locale) => {
      // TODO: Remove prints after TEST in RED with bombo-games.
      console.log(`>>> asPath ${asPath}`);
      console.log(`>>> pathname ${pathname}`);
      console.log(`>>> window.location.search ${window.location.search}`);

      const queryParamsString = window.location.search;
      const queryParams =  new URLSearchParams(queryParamsString);
      queryParams.delete("locale");

      if (isEmpty(queryParams.toString())) return router.push(pathname, pathname, { locale });

      const pathnameWithQueryParams = `${pathname}?${queryParams.toString()}`;
      router.push(pathnameWithQueryParams, pathnameWithQueryParams, { locale });
    },
    [asPath, router, locale]
  );

  // You can use:
  // t("landing.title"); OR const {t} = useTranslation("landing");
  // You can define a default value: t("landing.title","defaultValue");
  const t = useCallback(
    (keyString, defaultValue = "") => {
      const route = path ? `${path}.` : "";

      return get(TRANSLATIONS[locale], `${route}${keyString}`, defaultValue ?? keyString);
    },
    [TRANSLATIONS, locale, path]
  );

  const SwitchTranslation = useCallback(
    () => (
      <Switch
        size="small"
        variant="switcher"
        label1="En"
        label2="Es"
        defaultChecked={locale === locales[1]}
        onChange={(event) => {
          event.preventDefault();
          setLocale(event.target.checked ? locales[1] : locales[0]);
        }}
      />
    ),
    [locale]
  );

  return { t, locales, locale, setLocale, SwitchTranslation };
};

// References:
// https://betterprogramming.pub/build-your-own-usetranslation-hook-with-next-js-2c65017d323a
// https://nextjs.org/docs/advanced-features/i18n-routing#limits-for-the-i18n-config
// https://github.com/a-chris/use-translation-example
