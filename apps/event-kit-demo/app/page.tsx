import { EventKit } from "@evalycloud/templates";
import { loadEventLive } from "@evalycloud/external-data";
import content from "./content.generated";

// The page resolves external data; the template only renders it.
export default async function Page() {
  const live = await loadEventLive(content);
  return <EventKit content={content} live={live} />;
}
