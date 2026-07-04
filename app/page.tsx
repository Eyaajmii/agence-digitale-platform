import { auth } from "@/auth"; // ou ton fichier auth.ts
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  redirect("/dashboard");
}