import type { EducationSiteContent } from "@evalycloud/content-schema";
import { resolveEducationTemplate } from "../registry";

/** Entry point for the Education kit. Picks the template named in the content. */
export function EducationKit({ content }: { content: EducationSiteContent }) {
  const Template = resolveEducationTemplate(content.site.template);
  return <Template content={content} />;
}
