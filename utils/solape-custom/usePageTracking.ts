export {/*
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const usePageTracking = () => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!window.location.href.includes("localhost")) {
      ReactGA.initialize("G-ETGKDSK17C");
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      let page = location.pathname + location.search;
      ReactGA.send({ hitType: "pageview", page });
    }
  }, [initialized, location]);
};

export default usePageTracking;

*/}