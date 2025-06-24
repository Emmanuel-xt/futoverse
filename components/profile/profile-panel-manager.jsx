"use client";

import { useState, useEffect } from "react";
import { ProfilePanel } from "./profile-panel";

export function ProfilePanelManager({ currentUserId }) {
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.profilePanels) {
        setPanels(event.state.profilePanels);
      } else if (event.state?.panel) {
        // Handle other panels (notifications, connections)
        return;
      } else {
        // Close all profile panels
        setPanels([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openProfile = (username) => {
    const newPanels = [...panels, { username, id: Date.now() }];
    setPanels(newPanels);

    // Push to history
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
      // Go back to original state
      window.history.back();
    } else {
      // Update history with remaining panels
      window.history.replaceState(
        { profilePanels: newPanels },
        "",
        window.location.href
      );
    }
  };

  const closeTopPanel = () => {
    if (panels.length > 0) {
      closePanel(panels.length - 1);
    }
  };

  return (
    <>
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
      {/* Expose the openProfile function globally for other components */}
      <ProfilePanelContext.Provider value={{ openProfile }}>
        <div style={{ display: "none" }} />
      </ProfilePanelContext.Provider>
    </>
  );
}

// Context for accessing panel functions
import { createContext, useContext } from "react";

const ProfilePanelContext = createContext({});

export const useProfilePanel = () => {
  return useContext(ProfilePanelContext);
};

// Hook to be used in components that need to open profile panels
export const useProfilePanelManager = () => {
  const [panels, setPanels] = useState([]);

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

  return {
    panels,
    openProfile,
    closePanel,
    setPanels,
  };
};
