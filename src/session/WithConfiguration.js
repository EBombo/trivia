import React, { setGlobal, useEffect, useGlobal, useState } from "reactn";
import { collectionToDate, useEnvironment, useLanguageCode, useLocation, getCookie, useSettings, useTranslation, useUser } from "../hooks";
import { config, firestore, version } from "../firebase";
import get from "lodash/get";
import { darkTheme, lightTheme } from "../theme";
import moment from "moment";
import { setLocale as setLocaleYup } from "yup";
import { yup } from "../config";
import { register } from "next-offline/runtime";
import { spinLoader } from "../components/common/loader";
import dynamic from "next/dynamic";
import { ANIMATION, SPEED } from "../business";
import { useRouter } from "next/router";

const UpdateVersion = dynamic(() => import("../components/versions/UpdateVersion"), {
  loading: () => spinLoader(),
});

export const WithConfiguration = (props) => {
  const router = useRouter();

  const { locale, asPath } = router;
  const { locale: defaultLocale } = router.query;

  const [authUser] = useGlobal("user");
  const [settings, setSettings] = useGlobal("settings");
  const [, setIsVisibleLoginModal] = useGlobal("isVisibleLoginModal");

  const [authUserLS] = useUser();
  const [settingsLS, setSettingsLocalStorage] = useSettings();
  const [environment, setEnvironment] = useEnvironment();
  const [location, setLocationLocalStorage] = useLocation();
  const [languageCode, setLanguageCode] = useLanguageCode();
  const { setLocale } = useTranslation();

  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  let pageLoaded = false;

  useEffect(() => {
    const initializeConfig = async () => {
      environment !== config.firebase.projectId && localStorage.clear();
      setEnvironment(config.firebase.projectId);

      await setGlobal({
        user: authUserLS ? collectionToDate(authUserLS) : { id: firestore.collection("users").doc().id },
        settings: collectionToDate({ ...settingsLS, version }),
        location,
        audios: [],
        languageCode,
        ping: null,

        animationSpeed: ANIMATION.default,
        reproductionSpeed: SPEED.default,
        isAutomatic: false,

        register: null,
        isLoadingUser: true,
        isLoadingCreateUser: true,
        isVisibleLoginModal: false,
        isVisibleForgotPassword: false,
        openRightDrawer: false,
        openLeftDrawer: false,
        serverTime: new Date(),
        currentCurrency: "s/.",
        isAdmin: false,
        theme: get(authUserLS, "theme") === "lightTheme" ? lightTheme : darkTheme,
      });

      moment.locale(languageCode);
      setLocaleYup(yup[languageCode]);
    };

    const fetchVersion = () =>
      firestore.doc("settings/default").onSnapshot(async (snapshot) => {
        if (!snapshot.exists) return;

        const newSettings = snapshot.data();

        await setSettings(newSettings);
        setSettingsLocalStorage(newSettings);

        if (version !== newSettings.version && pageLoaded) {
          localStorage.clear();
          document.location.reload(true);
        }

        pageLoaded = true;
      });

    initializeConfig();
    const unsubscribeVersion = fetchVersion();
    setIsLoadingConfig(false);

    return () => unsubscribeVersion();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const savedLocale = getCookie("NEXT_LOCALE");

    if (savedLocale === locale) return;

    setLocale(savedLocale);

  }, [router.isReady]);

  // TODO: Remove unused code after TEST.
  // useEffect(() => {
  //   if (!router.isReady) return;
  //
  //   if (defaultLocale) return;
  //
  //   setLocale(languageCode);
  //
  // }, [languageCode, defaultLocale, router.isReady]);

  // useEffect(() => {
  //   console.log(`>>> defaultLocale ${defaultLocale}, router.isReady ${router.isReady}`);
  //
  //   if (!router.isReady) return;
  //
  //   if (!defaultLocale) return;
  //
  //   if (defaultLocale === locale) return;
  //
  //   console.log(`>>> useEffect init locale ${locale} defaultLocale ${defaultLocale}`);
  //
  //   console.log(`>>> defaultLocale ${defaultLocale}`);
  //
  //   setLocale(defaultLocale);
  //
  //   // router.push(asPath, asPath, { locale: defaultLocale });
  // }, [defaultLocale, router.isReady]);

  useEffect(() => {
    authUser && setIsVisibleLoginModal(false);
  }, [authUser, setIsVisibleLoginModal]);

  useEffect(() => {
    register("/sw.js", { scope: "/" });
  }, []);

  return version === get(settings, "version", version) ? (
    isLoadingConfig ? (
      spinLoader()
    ) : (
      props.children
    )
  ) : (
    <UpdateVersion />
  );
};
