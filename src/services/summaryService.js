function formatDisplayDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildPrompt(members, tracking, date) {
  const dateStr = formatDisplayDate(date)

  const membersList =
    members.length === 0
      ? 'No members registered.'
      : members
          .map(
            (m) =>
              `- ${m.fullName} | Instagram: @${m.instagram}${m.tiktok ? ` | TikTok: @${m.tiktok}` : ''} | Phone: ${m.phone}`
          )
          .join('\n')

  const activityList =
    members.length === 0
      ? 'No activity recorded.'
      : members
          .map((m) => {
            const t = tracking[m.id]
            const platforms = []
            if (t?.posted_on_myelino)
              platforms.push(`Myelino (${t.myelino_count} video${t.myelino_count !== 1 ? 's' : ''})`)
            if (t?.posted_on_instagram)
              platforms.push(`Instagram (${t.instagram_count} video${t.instagram_count !== 1 ? 's' : ''})`)
            if (t?.posted_on_tiktok)
              platforms.push(`TikTok (${t.tiktok_count} video${t.tiktok_count !== 1 ? 's' : ''})`)

            if (platforms.length === 0) return `- ${m.fullName}: No activity today`
            return `- ${m.fullName}: Posted on ${platforms.join(', ')}`
          })
          .join('\n')

  return `You are a compliance assistant for Myelino, a tech and food & beverage startup.
Analyze today's affiliate activity and return a structured daily summary.

Today's date: ${dateStr}

All registered members:
${membersList}

Today's activity:
${activityList}

Return your summary in exactly this format:

## Daily Affiliate Summary — ${dateStr}

**✅ Active Today ([COUNT])**
[List each member who posted on at least one platform, with platforms and video counts noted. If none, say "No members were active today."]

**❌ No Activity Today ([COUNT])**
[List each member with no recorded activity today. If all posted, say "All members were active today."]

**📊 Platform Breakdown**
[For each platform used (Myelino, Instagram, TikTok): how many members posted and total videos across all members]

**📈 Compliance Rate**
[X out of Y members were active today — X%]

**📝 Notes**
[Any brief observations about patterns or standout activity. If nothing to note, say "No unusual patterns."]`
}

export async function generateDailySummary(members, tracking, date) {
  const prompt = buildPrompt(members, tracking, date)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ prompt }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Request failed (${response.status})`)
  }

  return data.content[0].text
}
