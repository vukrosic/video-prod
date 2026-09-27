# Viral video ideas

Ideas built on work that already exists in the other repos, so every video has real
results behind it instead of just talking. Ranked by viral potential × how fast it can be made.

What the viral ones have in common:
- **A one-sentence premise a non-expert understands** ("27B model on a $250 GPU").
- **A stake or bet**: will it work? who wins?
- **A result revealed at the end**, so people keep watching.
- **Timing**: GPT-6 Luna/Sol came out on Sep 22, 2026, so comparisons to it are timely right now.

---

## 1. "I ran a 27B AI on a $250 GPU" ⭐ top pick
- **Source:** `qwen38-27b-rtx3060-inference`
- **Hook:** "Everyone says you need a $2,000 GPU for a real AI. I did it on an RTX 3060."
- **Why it spreads:** millions of people own a 3060 or a similar card. They'll try it and share it.
- **Structure:** it doesn't fit → quantize → offload → speculative decoding → final tokens/sec
  → side-by-side answers vs ChatGPT.
- **Thumbnail:** the 3060 with "27B" on it plus a shocked face or a tokens/sec number.

## 2. "GPT-6 vs an AI I trained for $50"
- **Sources:** `tiny-neural-lm-training-lab`, `tiny-llm-evals-lab`, `glm-5.3-flash-from-scratch`
- **Hook:** David vs Goliath. Ask both 10 questions and score them live.
- **The twist:** find the 2–3 tasks where the tiny model wins (a narrow skill it was trained on). That's the clip people share.

## 3. "I let AI do science alone for 30 days"
- **Sources:** `autoresearch-ai`, `open-discovery`, `autoresearch-llm-pretraining`
- **Hook:** no human touches it. What did it discover, and what did it get badly wrong?
- **Why it spreads:** "AI replaces scientists" is a hot debate, and the failures are as entertaining as the wins.

## 4. "Watching a tiny AI learn to think"
- **Source:** `tiny-reasoning-rl-lab`
- **Hook:** a timelapse of a small model going from nonsense to reasoning with RL, including its "aha moment."
- **Visual:** a chart of reward over training steps plus the model's actual answers at steps 0, 100, 500 and 2000.

## 5. "Can AI get you from New York to Tokyo in 1 hour?"
- **Source:** `one-hour-intercontinental-travel-research`
- **Hook:** huge mainstream appeal, not just for AI people. It covers the physics, the costs and whether it's actually possible.
- **Risk:** it's off-niche, so it could reach new viewers but converts fewer subscribers.

## 6. "I built Claude Code in 200 lines"
- **Source:** `tiny-coding-agent-lab`
- **Hook:** coding agents are everywhere. Show that the core loop fits on one screen, then have it build something real.

## 7. "I tried to use AI for cancer research"
- **Source:** `cancer-research`
- **Hook:** the highest stakes on the list, and the strongest emotional pull.
- **Caution:** frame it honestly (what AI can and can't do). Overclaiming here would hurt credibility.

---

## Recommendation
Make **#1 first**. The technical work is already done, the premise is instantly clear,
and the audience goes far beyond ML researchers. Then do **#2** while GPT-6 is still news.
