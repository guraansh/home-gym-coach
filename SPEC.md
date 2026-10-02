# Home Gym Coach — Spec v1

A personal-trainer app for one user: a desk-bound beginner training at home, ~1 hour at 5 PM, 7 days a week.

**Goals, in priority order:** build muscle · broader shoulders (V-taper) · cardiovascular health · lose visceral fat.

**Principles**
- The coach is **rule-based and explainable**. Every change it makes comes with a one-line reason ("+2.5 kg: you hit 3×12 with 2 reps in reserve").
- **Never punish a miss.** Adapt and carry on.
- **Logging must be fast.** One tap per set, pre-filled with the target.
- **Safety first.** A warm-up every session. Sharp pain means stop and swap the exercise.

---

## 1. Platform & tech

| Concern | Choice |
|---|---|
| App type | Installable PWA (Android home screen, works offline) |
| Stack | React + TypeScript + Vite, `vite-plugin-pwa` |
| Storage | IndexedDB via Dexie (data stays on the phone) |
| Charts | Recharts |
| Hosting | GitHub Pages, auto-deployed by GitHub Actions on push |
| Tests | Vitest unit tests for the progression engine and planner |

**Backup:** Export/Import as a JSON file from Settings. The Sunday check-in reminds you to export. Clearing Chrome's site data wipes the app's data, so the backup matters.

**Reminders (known limitation):** A PWA can't reliably fire a scheduled 5 PM notification without a server. v1 offers a one-tap **"Add daily 5 PM reminder to Google Calendar"** link that opens the app. Calendar reminders are reliable on Android.

---

## 2. Screens

1. **Onboarding:** age, height, bodyweight (optional), equipment inventory, preferred time.
2. **Day-1 assessment:** baseline tests (§5). Repeated at the end of week 4, then every 6 weeks.
3. **Today (home):**
   - Today's session card with a "Why this workout" explanation
   - Week strip showing done, missed and upcoming days
   - Streak, next milestone, and the coach's message
4. **Readiness check-in:** 4 sliders (sleep, energy, soreness, stress), about 10 seconds. Adjusts today's session (§4.4).
5. **Workout player:**
   - Warm-up → exercises → cool-down.
   - Each exercise card shows cues, common mistakes, a YouTube demo link, and the target sets, reps and load.
   - Set logger: load (pre-filled), reps (pre-filled), RIR picker (0 to 4+).
   - Auto-start rest timer with a sound and vibration at the end.
   - **Swap** (equivalent exercise for your equipment) and **Skip**, with a reason. Notes field.
   - **First time doing an exercise:** a calibration flow. If set 1 felt too easy (RIR ≥ 4), suggest a heavier set 2.
6. **Cardio player:**
   - Steady mode: timer, target talk-test cue, knob level, RPE at the end.
   - Interval mode: full-screen work/rest timer with beeps, "HARD/EASY" cues and knob targets.
7. **Session summary:** what you did, PRs hit, what changes next time and why, coach message.
8. **Progress:**
   - Strength trends per main lift (estimated 1RM)
   - Weekly sets per muscle vs target
   - Cardio minutes per week
   - Consistency calendar
   - **Waist and bodyweight chart**
   - Assessment comparisons (Day 1 vs now)
9. **Sunday check-in:** waist (required), bodyweight (optional), weekly report, backup reminder.
10. **Exercise library:** every exercise with cues and demo link. Filter by muscle or equipment. You can pin your own preferred video URL.
11. **Desk-break routines:** 2–3 minute posture routines you start on demand during the workday.
12. **Settings:** equipment inventory, rep/RIR display, export/import, calendar reminder link.

---

## 3. Program structure

### Phase 1: Foundation (weeks 1–4)
Learn the movement patterns and build the habit. Target RIR 2–3. About 6–8 hard sets per muscle per week.

| Day | Session | ~Time |
|---|---|---|
| Mon | Full Body A | 50 min |
| Tue | Zone 2 ride (start 25 min) + desk-posture mobility | 40 min |
| Wed | Full Body B | 50 min |
| Thu | Mobility + core + easy 15 min ride | 35 min |
| Fri | Full Body C | 50 min |
| Sat | Intro intervals (6 × 30 s hard / 90 s easy) + Zone 2 cool-down | 30 min |
| Sun | Recovery: walk / stretch + **Sunday check-in** | 20 min |

**Moving to Phase 2:** at least 10 of 12 strength sessions done and the week-4 re-assessment complete. Otherwise Phase 1 is extended by one week.

### Phase 2: Build (weeks 5–12+), Upper/Lower split
Target RIR 1–2. Sets per muscle per week start at about 10. Side delts, rear delts and lats get priority, at about 12–16 sets.

| Day | Session |
|---|---|
| Mon | **Upper A**: press + side delts |
| Tue | **Lower A** (squat focus) + 15 min Zone 2 |
| Wed | Zone 2 ride 40–50 min + mobility |
| Thu | **Upper B**: pull + rear delts |
| Fri | **Lower B** (hinge focus) + core |
| Sat | Intervals |
| Sun | Recovery + check-in |

**Mesocycle:** 4 weeks of building, where volume goes up by 1 set per priority muscle each week, followed by 1 **deload** week (half the sets, same load, RIR 3–4). An early deload triggers if 7-day average readiness is low **or** 2 or more main lifts regress.

### Session template (strength)
1. Warm-up, 5–8 min: easy ride, plus dynamic mobility and band activation (mini loops, theraband pull-aparts).
2. Main lifts: 2–3 compounds, 3 sets each.
3. Accessories: 2–3 exercises, with shoulder priority work.
4. Optional finisher: core or a short cycling burst.
5. Cool-down stretches, 3 min.

---

## 4. Coach engine (the rules)

### 4.1 Load types
| Type | How it progresses |
|---|---|
| Dumbbell | Next achievable weight from your **plate inventory** (handle weight + plate pairs, so the app knows real jumps) |
| Band | Next band in your ordered list, then a doubled band or added tension |
| Bodyweight | More reps, then the next variation in the exercise's **progression chain** (e.g. incline push-up → push-up → deficit push-up) |
| Timed hold | +5–10 s per session up to the cap, then the harder variant |

### 4.2 Double progression (per exercise)
Rep ranges:
- Compound lifts: 8–12 (squat, hinge, press, row)
- Isolation and shoulder work: 12–20 (laterals, face pulls, curls)
- Core holds: in seconds

After each session, the app compares what you did with the target:
- **All working sets at the top of the range, at or above target RIR:** increase load by the smallest available step. Reps go back to the bottom of the range.
- **Reps inside the range:** keep the load, aim for +1 rep per set.
- **2 or more sets below the range:** hold the load. If that happens in 2 sessions in a row, reduce the load by about 10% or regress the variation.
- **No progress in 3 sessions:** flag the exercise and suggest a swap to an equivalent variation.

### 4.3 Volume balance
- Every exercise maps to its primary and secondary muscles. Secondary muscles count as half a set.
- The planner tracks weekly sets per muscle against the phase target and fills gaps through accessory selection.
- No heavy sessions for the same muscle group within 48 hours.

### 4.4 Readiness adjustments
Each slider is scored 1–5 and the four are averaged.

| Score | Effect on today's session |
|---|---|
| ≥ 3.5 | As planned |
| 2.5–3.4 | As planned, target RIR +1, no load increases today |
| 1.5–2.4 | About 1/3 fewer sets, RIR +1 |
| < 1.5 | Swapped for a Zone 2 ride + mobility. The strength session moves to the next day. |

### 4.5 Missed sessions & time off
- **Missed strength session:** it replaces the next day's lighter session (strength days have priority), as long as it's within 2 days.
- **Away 8–14 days:** loads −10% for the first week back.
- **Away more than 14 days:** loads −20%, RIR +1, plus a re-assessment offer.

### 4.6 Cardio progression
- **Zone 2** (talk-test pace, RPE 3–4): +5 min per week up to 45–60 min. If the logged RPE is below target twice, suggest one more knob level.
- **Intervals**, roughly by week:
  - Weeks 1–3: 6 × 30 s hard / 90 s easy
  - Weeks 4–6: 8 × 30 s hard / 90 s easy
  - Weeks 7–9: 6 × 60 s hard / 60 s easy
  - Week 10+: 4 × 4 min hard / 3 min easy
  - Hard intervals target RPE 8–9.

### 4.7 Explainability
Every planner and progression decision produces a `reason` string. It's shown in "Why this workout" and in the session summary.

---

## 5. Assessment (Day 1, week 4, then every 6 weeks)
- Max push-ups with good form. If fewer than 5, incline push-ups are tested instead.
- Plank hold, and side plank on each side
- Bodyweight squats in 60 s, plus a form self-check
- Glute bridge hold (60 s cap)
- Mobility: toe-touch reach, wall overhead reach, deep-squat hold
- Resting heart rate (manual: count the pulse for 30 s, ×2)
- Cycle test: 10 min at a fixed knob level, logging RPE and the talk-test result
- Waist and bodyweight

Results set the starting variations (e.g. which push-up level you start at) and power the before/after comparisons.

---

## 6. Exercise library (v1)
Each exercise has:
- name, pattern, and primary/secondary muscles
- equipment required
- rep range type
- 3–5 cues and common mistakes
- its progression chain (easier and harder variations)
- a YouTube link

Demo links are YouTube **search** links (e.g. `youtube.com/results?search_query=dumbbell+lateral+raise+form`) so they never break. You can pin a specific video.

Exercises that need equipment you don't have yet stay locked until you add it in Settings.

| Pattern | Exercises |
|---|---|
| Squat | Box squat → goblet squat → DB front squat; split squat → Bulgarian split squat (chair) |
| Hinge | Glute bridge → single-leg bridge → DB Romanian deadlift → single-leg RDL; hip thrust (couch) |
| Horizontal push | Incline push-up → push-up → deficit push-up; DB floor press → DB bench press |
| Vertical push | Pike push-up; DB overhead press (seated/standing); Arnold press |
| Horizontal pull | Band row (door anchor); one-arm DB row; chest-supported DB row (bench) |
| Vertical pull | Band lat pulldown (door anchor) → band-assisted pull-up → negatives → pull-up |
| Side delts | DB lateral raise, lean-away lateral raise, band lateral raise |
| Rear delts / upper back | Band pull-apart (theraband), face pull (anchor), DB reverse fly |
| Arms | DB curl, hammer curl, overhead DB triceps extension, band pushdown |
| Core | Dead bug, bird dog, plank, side plank, hollow hold, Pallof press |
| Glutes (mini loops) | Lateral band walk, clamshell, banded bridge |
| Calves | Single-leg calf raise |
| Mobility / desk | Couch stretch, open book, cat-cow, chin tucks, wall slides, theraband dislocates, 90/90, world's greatest stretch |

**Week-1 reality:** you have no dumbbells or door anchor yet, so Phase 1 starts with bodyweight, mini-loop and theraband variations. Dumbbell exercises take over automatically once you add the equipment.

---

## 7. Motivation
- **"Never miss twice" streak:** a day counts if its session is done (a short recovery routine counts on recovery days). One miss is forgiven; two misses in a row reset the streak.
- **PRs:** estimated 1RM (Epley) per lift, rep PRs at a given load, longest hold, longest ride, interval progression level.
- **Milestones:** e.g. first workout, 10/25/50/100 sessions, first full push-up, first pull-up, 1,000 cardio minutes, waist −2 cm / −5 cm.
- **Coach messages:** templated messages that refer to your real numbers (e.g. "Goblet squat is up 6 kg in 3 weeks"). No generic quotes.
- **Weekly report** (Sunday): sessions done, volume vs target, cardio minutes, waist trend, and next week's focus.

---

## 8. Data model (IndexedDB)
| Table | Contents |
|---|---|
| `profile` | Age, height, start date, preferences |
| `equipment` | Owned items; DB handle + plate pairs; ordered band list; anchor, bar and bench flags |
| `programState` | Phase, week, mesocycle week, deload flag, next-session queue |
| `exerciseState` | Per exercise: current variation, load, rep target, stall counter, last-performed date |
| `sessions` | Planned vs completed, type, date, readiness score, duration, notes |
| `setLogs` | Session, exercise, set number, load, reps, RIR |
| `cardioLogs` | Session, mode, duration, knob level(s), RPE, talk-test result |
| `bodyMetrics` | Date, waist (cm), bodyweight (kg, optional) |
| `assessments` | Date and per-test results |
| `prs` / `milestones` | Achievement records |

The exercise library and program templates live in code, not in the database.

---

## 9. Build milestones
1. **Skeleton:** PWA shell, GitHub Pages deploy, onboarding, equipment inventory, exercise library. *(You can install it on your phone at this point.)*
2. **Training:** workout player, set logging, rest timer, cardio and interval players, session summary.
3. **Coach engine:** planner, progression, readiness, missed sessions, deloads. Covered by unit tests.
4. **Assessment & progress:** assessment flow, charts, Sunday check-in with waist/weight.
5. **Motivation & polish:** streaks, PRs, milestones, coach messages, backup, calendar reminder link.

## 10. Out of scope for v1 (later)
- **Claude weekly reviewer and chat coach** (v2, once there are 3–4 weeks of data)
- Nutrition tracking
- Heart-rate strap integration
- Camera rep counting
- Cloud sync across devices

---

## 11. Shopping list (in order)
1. Spin-lock adjustable dumbbell set, about 20–25 kg per hand (handles plus plates; more plates can be added later)
2. Long tube resistance bands with handles + door anchor
3. Doorframe pull-up bar
4. Adjustable bench (month 2–3)
5. Exercise mat, if you don't have one
