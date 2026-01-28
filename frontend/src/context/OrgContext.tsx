import React, { createContext, useContext, useEffect, useState } from "react";
import type { Organization } from "../api/types";
import { apiClient, demoMode } from "../api";

interface OrgContextValue {
  organizations: Organization[];
  activeOrg?: Organization;
  setActiveOrg: (org?: Organization) => void;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrgState] = useState<Organization | undefined>(undefined);

  useEffect(() => {
    if (demoMode) {
      apiClient.listOrganizations().then((data) => {
        setOrganizations(data);
        if (data.length && !activeOrg) {
          setActiveOrgState(data[0]);
        }
      });
    } else {
      const stored = localStorage.getItem("dwg_org");
      if (stored) {
        setActiveOrgState({ id: stored, name: stored, is_active: true });
      }
    }
  }, []);

  const setActiveOrg = (org?: Organization) => {
    setActiveOrgState(org);
    if (org) {
      localStorage.setItem("dwg_org", org.id);
    } else {
      localStorage.removeItem("dwg_org");
    }
  };

  useEffect(() => {
    if (demoMode && activeOrg) {
      localStorage.setItem("dwg_org", activeOrg.id);
    }
  }, [activeOrg]);

  return <OrgContext.Provider value={{ organizations, activeOrg, setActiveOrg }}>{children}</OrgContext.Provider>;
};

export const useOrg = (): OrgContextValue => {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error("useOrg must be used within OrgProvider");
  }
  return ctx;
};
