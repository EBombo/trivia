import get from "lodash/get";
import {useCallback, useRef, useEffect} from "reactn";
import {useRouter} from "next/router";
import {Switch} from "../components/form";

import en from "../../public/locales/en.json";
import es from "../../public/locales/es.json";
import isEmpty from "lodash/isEmpty";
import { useLanguageCode } from "./useLocalStorageState";

// TODO: Consider chunk the json files.
const TRANSLATIONS = {
  en: { ...en },
  es: { ...es },
};

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// TODO: Support capitalize.
export const useTranslation = (path) => {
  const router = useRouter();

  const inputRef = useRef(null);

  const { locale, asPath, pathname, query } = router;


  const [, setLanguageCode] = useLanguageCode();

  // Current languages.
  const locales = Object.keys(TRANSLATIONS);

  // Update language and redirect.
  const setLocale = useCallback(
    (locale) => {
      // TODO: Remove prints after TEST in RED with bombo-games.
      console.log(`>>> locale ${locale}`);
      console.log(`>>> asPath ${asPath}`);
      console.log(`>>> pathname ${pathname}`);

      // delete query.locale;
      console.log(`>>> query ${JSON.stringify(query, null, 2)}`);

      // setLanguageCode(locale);
      setCookie("NEXT_LOCALE", locale);

      router.push(asPath, asPath, { locale });
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
