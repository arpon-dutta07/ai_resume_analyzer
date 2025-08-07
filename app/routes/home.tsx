import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "smart feedback for your home page" },
  ];
}

export default function Home() {
  return <Welcome />;
}
