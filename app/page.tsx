import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LandingPublica from "@/components/landing-publica/LandingPublica";

export default async function Page() {
  const session = await auth();
  if (session) {
    redirect("/explorar");
  }

  return <LandingPublica />;
}
