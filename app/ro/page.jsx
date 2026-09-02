// /ro — the fresh-food homepage in Romanian.
// Shares the current fresh-food homepage with "/" and the other locales; content
// comes from the validated freshFoodContent.ro.js dictionary.
import { FreshFoodHomepage } from "../../src/views/homepage-demo/HomepageDemo.jsx";
import { getContent } from "../../src/views/fresh-food/locales.js";
import { buildFreshFoodMetadata, freshFoodViewport } from "../../src/views/fresh-food/metadata.js";

export const metadata = buildFreshFoodMetadata("ro");
export const viewport = freshFoodViewport;

export default function RomanianHomePage() {
  return <FreshFoodHomepage content={getContent("ro")} />;
}
