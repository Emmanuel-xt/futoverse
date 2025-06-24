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
      console.log("Popstate event:", event);
      console.log("Popstate event state:", event?.state);
      // If the state has profilePanels, set them
      if (event.state?.profilePanels) {
        setPanels(event.state.profilePanels);
        console.log("panels dey==>", panels.length());
      } else if (!event.state?.panel) {
        // Only close profile panels if it's not another type of panel
        setPanels([]);
      }
      // const newPanels = [...panels, { username, id: Date.now() }];
      // const newUrl = `/profile?panels=${panelUsernames}`;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openProfile = (username) => {
    const newPanels = [...panels, { username, id: Date.now() }];
    setPanels(newPanels);

    const panelUsernames = newPanels.map((p) => p.username).join(",");
    const newUrl = `/profile?panels=${panelUsernames}`;

    window.history.pushState({ profilePanels: newPanels }, "", newUrl);
    console.log("event.state==>", window.history.state);
  };

  const closePanel = (panelIndex) => {
    const newPanels = panels.slice(0, panelIndex);
    setPanels(newPanels);

    if (newPanels.length === 0) {
      // window.history.back();
      console.log("No more panels, going back");
    } else {
      window.history.replaceState(
        { profilePanels: newPanels, fromPanels: true },
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
