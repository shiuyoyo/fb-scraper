import type { EventSiteContent } from "@evalycloud/content-schema";
import { resolveEventTemplate } from "../registry";
import type { EventLive } from "./status-types";

/**
 * Entry point for the Event kit. Picks the template named in the content.
 * `live` is resolved by the page — templates never fetch.
 */
export function EventKit({ content, live }: { content: EventSiteContent; live?: EventLive }) {
  const Template = resolveEventTemplate(content.site.template);
  return <Template content={content} live={live} />;
}
