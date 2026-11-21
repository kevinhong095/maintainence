/*
  Tank Care Guide — all copy and owner assignments.

  This is the only file you need to edit to change wording.
  - Wrap bold text in **double asterisks**.
  - Owners are "jon" or "matt" (see `people`).
  - Step ranges are [first, last].
*/
window.CONTENT = {
  site: {
    title: "Tank Care Guide",
    description: "Everything Jon and Matt need to look after the tanks."
  },

  people: {
    jon: { name: "Jon", initial: "J" },
    matt: { name: "Matt", initial: "M" }
  },

  // Bottom nav order
  nav: ["home", "water-changes", "paludariums", "begonias", "making-water"],

  shared: {
    allDone: "All done. Thank you! Send me a quick message.",
    lookOff: "**Something look off?** Take a quick video and send it to me.",
    labels: {
      quickList: "Quick list",
      steps: "Steps",
      reset: "Reset",
      step: "Step",
      mostImportant: "Most important",
      waterLevel: "Water level",
      stayHome: "Stay home",
      ifTime: "If there's time",
      asNeeded: "As needed",
      stopHere: "Stop here",
      cmBelowRim: "2 cm below rim",
      inFromRim: "2 in from rim",
      drain: "Drain",
      refill: "Refill",
      mix: "Mix"
    }
  },

  views: {
    home: {
      navLabel: "Home",
      title: "Tank Care Guide",
      accent: "text"
    },

    "water-changes": {
      navLabel: "Water Changes",
      title: "Water Changes",
      owner: "jon",
      accent: "aqua",
      eyebrow: "ONCE A WEEK · TWICE IS IDEAL",
      intro: "120M and 90L. Change **75%** of the water. The steps are the same for both tanks.",
      note: "**The day before:** give me a heads-up with the time you plan to come.",
      stageLabel: "A tank draining to the stop line, then refilling",
      quickList: [
        { text: "Lights ON, filters OFF", steps: [1, 4] },
        { text: "Drain 75%", steps: [5, 9] },
        { text: "Refill to 2 cm below the rim", steps: [10, 13] },
        { text: "Filters back ON", steps: [14, 14] },
        { text: "Pack up: hose, adapter, dollies", steps: [15, 17] }
      ],
      phases: [
        {
          name: "Before you start",
          steps: [
            { n: 1, text: "On the iPad app, turn the **lights ON** and **all filters OFF**." },
            { n: 2, text: "Lay paper towels on the floor in front of the tank." },
            { n: 3, text: "Roll a dolly of full totes over to the tank." },
            { n: 4, text: "Connect the 50-ft hose to the **water change valve** on the bathroom sink." }
          ]
        },
        {
          name: "Drain",
          steps: [
            { n: 5, text: "Put the **adapter** on the pump, then connect the hose. The pump is 16mm and the hose is 12mm, so they won't fit together without the adapter." },
            { n: 6, text: "Check that the **mesh bag** is secure on the pump so fish and shrimp can't get sucked in." },
            { n: 7, text: "Place the pump at the **front-left** of the tank, on the sand." },
            { n: 8, text: "Plug it in. While it drains, **scrub the glass** with the melamine sponge." },
            { tip: true, text: "**If there's time:** use the razor blade to clean the glass down to the substrate. Check the glass from different angles to make sure it's completely clean." },
            { n: 9, text: "**Unplug** once 75% of the water is out. On the 120M, the mark on the back-left glass shows where to stop." }
          ]
        },
        {
          name: "Refill",
          steps: [
            { n: 10, text: "Take off the adapter and the hose. Attach the **~6-ft piece of 16/22 tubing**." },
            { n: 11, text: "Move the pump into a tote." },
            { n: 12, text: "Rest the tubing in the **plastic box with holes**, in the **back-left corner** of the tank. Clamp the box, the tank rim and the tubing together so nothing slips." },
            { n: 13, variant: "caution", text: "Plug in the pump and fill to **2 cm below the rim**. The 120M takes about 1.5 totes. **Unplug before the tote runs dry.**" }
          ]
        },
        {
          name: "Finish",
          steps: [
            { n: 14, variant: "critical", text: "On the iPad app, turn **all filters back ON.** Don't skip this. The tank needs its filters running." },
            { n: 15, text: "Roll up the hose and the tubing." },
            { n: 16, text: "Put the **adapter** on the table where it's easy to see." },
            { n: 17, text: "Roll the dollies back into the bathroom." }
          ]
        }
      ]
    },

    paludariums: {
      navLabel: "Paludariums",
      title: "Paludariums",
      owner: "matt",
      accent: "moss",
      eyebrow: "EVERY DAY",
      intro: "Foresta 30 (small), Foresta 60 (medium) and Foresta 90 (large).",
      tanks: [
        { name: "Foresta 30", size: "SMALL", label: "Foresta 30, small: mist and top off" },
        { name: "Foresta 60", size: "MEDIUM", label: "Foresta 60, medium: mist and top off" },
        { name: "Foresta 90", size: "LARGE", label: "Foresta 90, large: mist and top off" }
      ],
      helper: "Tap each tank when it's misted and topped off.",
      steps: [
        { n: 1, text: "**Mist all 3 paludariums.** Use a light, even mist over everything. It should be slightly damp, not soaking wet." },
        { n: 2, variant: "caution", text: "**Top off the water** in all 3 paludariums, up to **1 cm below the rim**." }
      ]
    },

    begonias: {
      navLabel: "Begonias",
      title: "Begonias",
      owner: "matt",
      accent: "rose",
      eyebrow: "TWICE A WEEK",
      intro: "One quick step.",
      stageLabel: "Three begonia leaves rising from a planter",
      task: "Mist the begonias"
    },

    "making-water": {
      navLabel: "Making Water",
      title: "Making Water",
      owner: "matt",
      accent: "pure",
      eyebrow: "WHEN THE TOTES ARE EMPTY",
      intro: "Making RODI water. Do this after a water change empties the totes, so they're full for next time.",
      warning: "**This takes 2 to 2.5 hours. Do not leave the apartment while it's filling.** An overflowing tote will flood the apartment.",
      stageLabel: "A tote on a dolly filling with RODI water to 2 in from the rim, then mixed and closed with a lid",
      quickList: [
        { text: "Clamp the line, tap ON, pump switch ON", steps: [1, 3] },
        { text: "Fill to 2 in from the rim. Stay home.", steps: [4, 4] },
        { text: "Tap OFF, pump switch OFF", steps: [5, 5] },
        { text: "Remineralize and mix", steps: [6, 7] },
        { text: "Lids on", steps: [8, 8] }
      ],
      steps: [
        { n: 1, text: "**Clamp** the RODI line to the rim of an empty tote." },
        { n: 2, text: "Turn the **cold tap ON**, full." },
        { n: 3, text: "Flip the **pump switch ON**. It's the small switch next to the outlet. If you skip this, filling takes 10 times longer." },
        { n: 4, variant: "stay", text: "**Set a 2-hour timer** and check the tote often." },
        { n: 5, text: "When the water is **2 inches from the rim**, turn the **cold tap OFF** and flip the **pump switch OFF**." },
        { n: 6, text: "**Remineralize:** put 1 scoop of remineralizer (the scoop is inside its container) into a 32-oz deli container. Fill it with RODI water, shake hard, then pour it into the tote." },
        { n: 7, text: "**Mix:** run the submersible pump (it's kept in the sink) in the tote for 1 to 2 minutes." },
        { n: 8, text: "**Put the lids on.** The bottom tote on each dolly gets **2 lids** so it can hold the weight of the tote on top of it." }
      ]
    }
  },

  home: {
    hero: {
      eyebrow: "WHILE I'M AWAY",
      title: "Tank Care Guide",
      intro: "Thanks for doing this, Jon and Matt. Everything you need is right here. Find your name, then tap your task."
    },

    sections: {
      crew: "Who's on what",
      schedule: "Schedule",
      bestPractices: "Best Practices",
      tanks: "The Tanks",
      oneOff: "One-Off Tasks"
    },

    // dots: "weekly-ideal" | "daily" | "twice" | "as-needed"
    schedule: [
      { view: "water-changes", frequency: "Once a week (twice is ideal)", task: "Water change on the 120M and the 90L", dots: "weekly-ideal" },
      { view: "paludariums", frequency: "Every day", task: "Mist and top off the 3 paludariums", dots: "daily" },
      { view: "begonias", frequency: "Twice a week", task: "Mist the begonias", dots: "twice" },
      { view: "making-water", frequency: "When the totes are empty", task: "Make RODI water", dots: "as-needed" }
    ],
    scheduleNote: "**Water changes:** once a week per aquarium is the minimum. Twice a week per aquarium is ideal.",

    waterLevels: {
      title: "Water levels",
      gauges: [
        { label: "Paludariums", depth: "1 cm", accent: "moss", gap: 10 },
        { label: "Aquariums", depth: "2 cm", accent: "aqua", gap: 20 }
      ],
      lines: [
        "**Paludariums:** fill to **1 cm below the rim**.",
        "**Aquariums (120M and 90L):** fill to **2 cm below the rim**."
      ]
    },

    everyone: {
      label: "Everyone",
      rows: [
        { icon: "video", text: "**Something look off?** If anything seems out of the ordinary, or you're even a little concerned, take a quick video and send it to me." },
        { icon: "power", text: "**Before you leave:** make sure all the filters are running." },
        { icon: "message", text: "**All done?** Send me a quick message once everything's finished." }
      ]
    },

    waterChangeDays: {
      label: "Water change days",
      owner: "jon",
      rows: [
        { icon: "calendar", text: "**The day before:** give me a heads-up with the time you plan to come." },
        { icon: "hose", text: "**When you're finished:** roll up the hose and the tubing, and put the adapter on the table where it's easy to see." },
        { icon: "razor", text: "**If there's time:** use the razor blade to clean the glass down to the substrate. Check the glass from different angles to make sure it's completely clean." }
      ]
    },

    tanks: [
      { icon: "paludariums", accent: "moss", view: "paludariums", text: "**Paludariums:** Foresta 30 (small), Foresta 60 (medium), Foresta 90 (large)" },
      { icon: "water-changes", accent: "aqua", view: "water-changes", text: "**Aquariums:** 90L (20-gallon long), 120M (the big one)" },
      { icon: "begonias", accent: "rose", view: "begonias", text: "**Begonias:** the container of begonias (no water)" }
    ],

    oneOff: {
      owner: "matt",
      chip: "One-off task",
      items: ["Move all the **pygmy corys** from the 90L into the **Foresta 90**."]
    },

    footer: "Built with Claude Code"
  }
};
