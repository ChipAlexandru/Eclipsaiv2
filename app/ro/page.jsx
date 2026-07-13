// /ro — the fresh-food homepage in Romanian.
// Shares src/views/FreshFoodHome.jsx with "/" and the other locales; content
// comes from the validated freshFoodContent.ro.js dictionary.
import { FreshFoodHome } from "../../src/views/FreshFoodHome.jsx";
import { getContent } from "../../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("ro");
export const viewport = freshFoodViewport;

export default function RomanianHomePage() {
  return <FreshFoodHome content={getContent("ro")} />;
}
