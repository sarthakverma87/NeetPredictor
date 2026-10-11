# PRD — NEET College Predictor (MVP)

**Problem.** After results, ~22 lakh NEET candidates know a score and category, not a rank. They hunt through YouTube and Telegram for "which college can I get?" That question is one of the highest-intent lead moments in medical ed-tech.

**Target user.** A 17–20 year old aspirant or their parent, on a mid-range Android phone and mobile data. They will not type a rank. They will abandon a long form.

**MVP scope.** One mobile page: score (0–720) + category + home state → name + 10-digit phone (with consent) → Safe / Moderate / Reach government MBBS list from the 50-college 2025 AIQ file. Every lead stores phone, score, category, state, predicted rank, timestamp and UTMs. Funnel events are logged to the same Google Sheet.

**What we cut, and why.** OTP and accounts add friction against the only success metric (qualified leads). State quota, private/deemed colleges, BDS and AYUSH are out of scope and would also need data we were not given. A full CRM dashboard can wait; the Sheet + Funnel tab is enough to review source quality.

**Success metric.** Lead submit rate = `form_submit / page_view`. **Target: 25%** on tagged traffic (WhatsApp group, Instagram story, LinkedIn) from at least 10 real users in week 1. Secondary: `form_start / page_view` ≥ 60%, so we know the first screen is understood.
