//Backend only
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Exemple usage API
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
export const RESEND_API_KEY = process.env.RESEND_API_KEY!;