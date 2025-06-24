"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ProfilePanel } from "./profile-panel";

const ProfilePanelContext = createContext({});

export const useProfilePanel = () => {
  const context = useContext(ProfilePanelContext);
  if (!context) {
    throw new Error("useProfilePanel must be used within ProfilePanelProvider");
  }
  return context;
};

export function ProfilePanelProvider({ children, currentUserId }) {
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.profilePanels) {
        setPanels(event.state.profilePanels);
      } else if (!event.state?.panel) {
        // Only close profile panels if it's not another type of panel
        setPanels([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openProfile = (username) => {
    const newPanels = [...panels, { username, id: Date.now() }];
    setPanels(newPanels);

    window.history.pushState(
      { profilePanels: newPanels },
      "",
      window.location.href
    );
  };

  const closePanel = (panelIndex) => {
    const newPanels = panels.slice(0, panelIndex);
    setPanels(newPanels);

    if (newPanels.length === 0) {
      window.history.back();
    } else {
      window.history.replaceState(
        { profilePanels: newPanels },
        "",
        window.location.href
      );
    }
  };

  return (
    <ProfilePanelContext.Provider value={{ openProfile, panels }}>
      {children}

      {/* Render all panels */}
      {panels.map((panel, index) => (
        <ProfilePanel
          key={panel.id}
          username={panel.username}
          currentUserId={currentUserId}
          isOpen={true}
          onClose={() => closePanel(index)}
          onOpenProfile={openProfile}
          panelIndex={index}
        />
      ))}
    </ProfilePanelContext.Provider>
  );
}
