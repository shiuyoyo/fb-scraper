import { RestaurantKit } from "@evalycloud/templates";
import content from "./content.generated";

// Sheet overrides are already baked into content.generated.ts by the build
// script (static export can't fetch at page render). The page just renders.
export default function Page() {
  return <RestaurantKit content={content} />;
}
