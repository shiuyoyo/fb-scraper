import type { ReactNode } from "react";
import type {
  BusinessSiteContent,
  EducationSiteContent,
  EventSiteContent,
  KitName,
  PortfolioSiteContent,
  RestaurantSiteContent,
} from "@evalycloud/content-schema";
import { templateMatrix } from "@evalycloud/content-schema";
import {
  availableTemplates,
  baselineTemplate,
  isTemplateAvailable,
  isTemplateValid,
  templateStatus,
} from "./matrix";
import type { EventLive } from "./event/status-types";
import { BusinessClassicTemplate } from "./business/classic";
import { EducationClassicTemplate } from "./education/classic";
import { EventClassicTemplate } from "./event/classic";
import { PortfolioClassicTemplate } from "./portfolio/classic";
import { RestaurantClassicTemplate } from "./restaurant/classic";

export { availableTemplates, baselineTemplate, isTemplateAvailable, isTemplateValid, templateStatus };
export type { TemplateStatus } from "./matrix";

export type BusinessTemplateComponent = (props: { content: BusinessSiteContent }) => ReactNode;
export type RestaurantTemplateComponent = (props: { content: RestaurantSiteContent }) => ReactNode;
export type EventTemplateComponent = (props: { content: EventSiteContent; live?: EventLive }) => ReactNode;
export type EducationTemplateComponent = (props: { content: EducationSiteContent }) => ReactNode;
export type PortfolioTemplateComponent = (props: { content: PortfolioSiteContent }) => ReactNode;

/**
 * kit + template name → component. The keys here must match availableTemplates
 * in matrix.ts; that file is the tested source of truth for status, this is
 * the wiring. Twelve planned templates are intentionally absent, not stubbed.
 */
const implemented = {
  business: { classic: BusinessClassicTemplate },
  restaurant: { classic: RestaurantClassicTemplate },
  event: { classic: EventClassicTemplate },
  education: { classic: EducationClassicTemplate },
  portfolio: { classic: PortfolioClassicTemplate },
} as const;

function resolve<C>(kit: KitName, requested: string | undefined): C {
  const table = implemented[kit] as unknown as Record<string, C>;

  if (requested === undefined) return table[baselineTemplate];
  if (table[requested]) return table[requested];

  if (isTemplateValid(kit, requested)) {
    console.warn(
      `[templates] ${kit}/${requested} is planned but not implemented yet (RFC-002). ` +
        `Rendering ${kit}/${baselineTemplate}. This is a fallback, not completion.`,
    );
  } else {
    console.warn(
      `[templates] ${kit}/${requested} is not a valid template. ` +
        `Valid: ${templateMatrix[kit].join(", ")}. Rendering ${kit}/${baselineTemplate}.`,
    );
  }
  return table[baselineTemplate];
}

export function resolveBusinessTemplate(name?: string): BusinessTemplateComponent {
  return resolve<BusinessTemplateComponent>("business", name);
}
export function resolveRestaurantTemplate(name?: string): RestaurantTemplateComponent {
  return resolve<RestaurantTemplateComponent>("restaurant", name);
}
export function resolveEventTemplate(name?: string): EventTemplateComponent {
  return resolve<EventTemplateComponent>("event", name);
}
export function resolveEducationTemplate(name?: string): EducationTemplateComponent {
  return resolve<EducationTemplateComponent>("education", name);
}
export function resolvePortfolioTemplate(name?: string): PortfolioTemplateComponent {
  return resolve<PortfolioTemplateComponent>("portfolio", name);
}
