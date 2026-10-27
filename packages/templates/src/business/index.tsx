import type { BusinessSiteContent } from "@evalycloud/content-schema";
import { resolveBusinessTemplate } from "../registry";

/** Entry point for the Business kit. Picks the template named in the content. */
export function BusinessKit({ content }: { content: BusinessSiteContent }) {
  const Template = resolveBusinessTemplate(content.site.template);
  return <Template content={content} />;
}
