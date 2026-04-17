"use server"

import { createAdminClient } from "@/lib/supabase/server"

export async function getEndowmentStats() {
  const supabase = await createAdminClient()

  // Fetch all activities that are completed
  const { data: activities, error } = await supabase
    .from("activities")
    .select("funding_raised, funding_goal, status")
    .in("status", ["completed", "cancelled"])

  if (error) {
    console.error("Error fetching activities for endowment:", error)
    return {
      totalRaised: 0,
      disbursed: 0
    }
  }

  let endowmentRaised = 0

  activities?.forEach(act => {
    const raised = Number(act.funding_raised || 0)
    const goal = Number(act.funding_goal || 0)

    // Rule 1: Exceeds target
    if (raised > goal) {
      endowmentRaised += (raised - goal)
    }

    // Rule 2: Under 70% threshold
    if (raised > 0 && raised < (0.7 * goal)) {
      endowmentRaised += raised
    }
  })

  // To find disbursed endowment funds, we look at disbursements that have specific text.
  const { data: disbursements } = await supabase
    .from("disbursements")
    .select("amount, notes")
    .eq("status", "completed")
    .ilike("notes", "%Dana Abadi%")

  const endowmentDisbursed = disbursements?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  return {
    totalRaised: endowmentRaised,
    disbursed: endowmentDisbursed
  }
}

export async function getEndowmentDisbursements() {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("disbursements")
    .select("notes, amount, community:communities(name)")
    .eq("status", "completed")
    .ilike("notes", "%Dana Abadi%")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching endowment disbursements:", error)
    return []
  }

  return data || []
}
