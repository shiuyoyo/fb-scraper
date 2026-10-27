import type { RestaurantSiteContent } from "@evalycloud/content-schema";
import { resolveRestaurantTemplate } from "../registry";

/** Entry point for the Restaurant kit. Picks the template named in the content. */
export function RestaurantKit({ content }: { content: RestaurantSiteContent }) {
  const Template = resolveRestaurantTemplate(content.site.template);
  return <Template content={content} />;
}
