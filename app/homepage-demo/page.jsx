import { FreshFoodHomepage } from "../../src/views/homepage-demo/HomepageDemo.jsx";

export const metadata = {
  title: "Eclipsai homepage proposal",
  description: "A working proposal for the first four sections of the Eclipsai website.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#19171f",
};

export default function HomepageDemoPage() {
  return <FreshFoodHomepage />;
}
