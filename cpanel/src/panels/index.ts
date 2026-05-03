import { DashboardDef } from "./Dashboard.js";
import { InsightsDef } from "./Insights.js";
import { ConversationsDef } from "./Conversations.js";
import { LiveDef } from "./Live.js";
import { SearchDef } from "./Search.js";
import { CostDef } from "./Cost.js";
import { DigestDef } from "./Digest.js";
import { PlansDef } from "./Plans.js";
import { SessionsDef } from "./Sessions.js";
import { ProjectsDef } from "./Projects.js";
import { SettingsDef } from "./Settings.js";
import { CleanupDef } from "./Cleanup.js";
import type { PanelDef } from "./types.js";

export const PANELS: PanelDef[] = [
  DashboardDef,
  InsightsDef,
  ConversationsDef,
  LiveDef,
  SearchDef,
  CostDef,
  DigestDef,
  PlansDef,
  SessionsDef,
  ProjectsDef,
  SettingsDef,
  CleanupDef,
];
