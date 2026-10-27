import { EventKit } from "@evalycloud/templates";
import content, { live } from "./content.generated";

// Sheet overrides and live values are already baked into content.generated.ts
// by the build script (static export can't fetch at page render).
export default function Page() {
  return <EventKit content={content} live={live} />;
}
