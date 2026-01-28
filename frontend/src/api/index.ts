import { realClient } from "./client";
import { mockClient } from "./mock";
import type { ApiClient } from "./types";

const isDemo = import.meta.env.VITE_DEMO_MODE === "true";

export const apiClient: ApiClient = isDemo ? mockClient : realClient;
export const demoMode = isDemo;
