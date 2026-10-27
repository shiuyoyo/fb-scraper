import type { KitName } from "@evalycloud/content-schema";
import { templateMatrix } from "@evalycloud/content-schema";

export type TemplateStatus = "available" | "planned";

/**
 * Which templates are implemented, as plain data with no React imports — so
 * the product matrix can be reasoned about and tested without loading any
 * component. The registry builds its component map from the same source of
 * truth (these keys), keeping "available" here in step with what actually
 * renders.
 */
export const availableTemplates: Record<KitName, string[]> = {
  business: ["classic"],
  restaurant: ["classic"],
  event: ["classic"],
  education: ["classic"],
  portfolio: ["classic"],
};

export const baselineTemplate = "classic" as const;

export function templateStatus(): Array<{ kit: KitName; template: string; status: TemplateStatus }> {
  const out: Array<{ kit: KitName; template: string; status: TemplateStatus }> = [];
  for (const kit of Object.keys(templateMatrix) as KitName[]) {
    for (const template of templateMatrix[kit]) {
      const available = availableTemplates[kit].includes(template);
      out.push({ kit, template, status: available ? "available" : "planned" });
    }
  }
  return out;
}

export function isTemplateValid(kit: KitName, template: string): boolean {
  return (templateMatrix[kit] as readonly string[]).includes(template);
}

export function isTemplateAvailable(kit: KitName, template: string): boolean {
  return availableTemplates[kit].includes(template);
}
