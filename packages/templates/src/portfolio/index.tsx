import type { PortfolioSiteContent } from "@evalycloud/content-schema";
import { resolvePortfolioTemplate } from "../registry";

/** Entry point for the Portfolio kit. Picks the template named in the content. */
export function PortfolioKit({ content }: { content: PortfolioSiteContent }) {
  const Template = resolvePortfolioTemplate(content.site.template);
  return <Template content={content} />;
}
