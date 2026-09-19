import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

const ServerStatusContext = createContext(null);

export const ServerStatusProvider = ({ children }) => {
  const [serverStatus, setServerStatus] = useState("checking");
  const [bannerClosed, setBannerClosed] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const emailContent = "Hello";
    const tone = "Friendly";
    const checkServer = async () => {

      // Wait 5 seconds before showing the wake-up message
      timerRef.current = setTimeout(() => {
        setServerStatus("waking");
      }, 5000);


        try{
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/email/generate`, {
                  emailContent,
                  tone
                });

        // Server responded before/after the 5-second timer
        clearTimeout(timerRef.current);

        setServerStatus("ready");

      } catch (error) {

        clearTimeout(timerRef.current);

        setServerStatus("ready");

        console.error("Ping request failed:", error);
      }
    };

    checkServer();

    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const closeBanner = () => {
    setBannerClosed(true);
  };

  const openBanner = () => {
    setBannerClosed(false);
  };

  return (
    <ServerStatusContext.Provider
      value={{
        serverStatus,
        bannerClosed,
        closeBanner,
        openBanner,
      }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
};

export const useServerStatus = () => {
  return useContext(ServerStatusContext);
};




