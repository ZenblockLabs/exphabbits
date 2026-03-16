import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // 2. Check admin role
    const { data: isAdmin } = await anonClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Use service role to fetch activity data
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get recent users (signups & logins)
    const { data: usersData } = await serviceClient.auth.admin.listUsers({ perPage: 100 });
    const users = usersData?.users ?? [];

    // Build activity events
    const activities: any[] = [];

    // Recent signups
    for (const u of users) {
      activities.push({
        type: "signup",
        email: u.email,
        timestamp: u.created_at,
        description: `${u.email} signed up`,
      });
      if (u.last_sign_in_at && u.last_sign_in_at !== u.created_at) {
        activities.push({
          type: "login",
          email: u.email,
          timestamp: u.last_sign_in_at,
          description: `${u.email} logged in`,
        });
      }
    }

    // Recent expenses (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentExpenses } = await serviceClient
      .from("expenses")
      .select("category, month, year, created_at, updated_at, user_id")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(50);

    // Recent habits
    const { data: recentHabits } = await serviceClient
      .from("habits")
      .select("name, created_at, updated_at, user_id")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(50);

    // Recent budgets
    const { data: recentBudgets } = await serviceClient
      .from("budgets")
      .select("category, year, amount, created_at, updated_at, user_id")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(50);

    // Map user IDs to emails
    const userMap = new Map(users.map((u: any) => [u.id, u.email]));

    for (const exp of recentExpenses ?? []) {
      const email = userMap.get(exp.user_id) || "unknown";
      activities.push({
        type: "expense",
        email,
        timestamp: exp.created_at,
        description: `${email} added expense: ${exp.category} (${exp.month} ${exp.year})`,
      });
      if (exp.updated_at !== exp.created_at) {
        activities.push({
          type: "expense_update",
          email,
          timestamp: exp.updated_at,
          description: `${email} updated expense: ${exp.category} (${exp.month} ${exp.year})`,
        });
      }
    }

    for (const habit of recentHabits ?? []) {
      const email = userMap.get(habit.user_id) || "unknown";
      activities.push({
        type: "habit",
        email,
        timestamp: habit.created_at,
        description: `${email} created habit: ${habit.name}`,
      });
    }

    for (const budget of recentBudgets ?? []) {
      const email = userMap.get(budget.user_id) || "unknown";
      activities.push({
        type: "budget",
        email,
        timestamp: budget.created_at,
        description: `${email} set budget: ${budget.category} ${budget.year} (₹${budget.amount})`,
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(JSON.stringify({ activities: activities.slice(0, 100) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
