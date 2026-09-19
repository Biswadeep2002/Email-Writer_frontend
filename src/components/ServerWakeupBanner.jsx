import { FiAlertCircle, FiX, FiZap } from "react-icons/fi";
import { useEffect, useRef } from "react";
import { useServerStatus } from "../ServerStatusContext";

const ServerWakeupBanner = ({ onOpenVideo, videoOpen }) => {
  const {
    serverStatus,
    bannerClosed,
    closeBanner,
    openBanner,
  } = useServerStatus();
  const bannerRef = useRef(null);

  useEffect(() => {
    if (videoOpen || bannerClosed || serverStatus === "ready" || serverStatus === "checking") {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!bannerRef.current?.contains(event.target)) {
        closeBanner();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeBanner();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [bannerClosed, closeBanner, serverStatus, videoOpen]);

  // Don't show anything while checking or when server is ready
  if (serverStatus === "ready" || serverStatus === "checking") {
    return null;
  }

  // User closed the banner
  if (bannerClosed) {
    return (
      <button
        onClick={openBanner}
        title="Show server status"
        aria-label="Show server status"
        className="server-wakeup-trigger"
      >
        <FiZap aria-hidden="true" />
      </button>
    );
  }

  // Server is taking longer than 5 seconds
  return (
    <aside ref={bannerRef} className="server-wakeup-banner" role="status" aria-live="polite">
      {/* Close button */}
      <button
        onClick={closeBanner}
        title="Hide server status"
        aria-label="Hide server status"
        className="server-wakeup-close"
      >
        <FiX aria-hidden="true" />
      </button>

      <div className="server-wakeup-content">

        {/* Icon */}
        <div className="server-wakeup-icon">
          <FiAlertCircle aria-hidden="true" />
        </div>

        {/* Message */}
        <div className="server-wakeup-copy">
          <h3>
            Server may be waking up
          </h3>

          <p>
            This project is hosted on Render's free tier, so the first
            request after inactivity may take a little longer. Please wait
            for a moment while the application becomes ready. In the meantime, you can click on{" "}
            <button className="server-wakeup-video-link" type="button" onClick={onOpenVideo}>
              Watch Extension Video
            </button>{" "}
            to see the Chrome Extension in action.
          </p>
        </div>

      </div>
    </aside>
  );
};

export default ServerWakeupBanner;