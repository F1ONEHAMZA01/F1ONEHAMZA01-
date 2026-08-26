import fs from "node:fs";
const candidates = fs.readFileSync("dead-css-report.txt", "utf8").split("\n").map(l => l.trim().split("  ")[0]).filter(Boolean);
const skip = new Set(); // dynamically constructed prefixes
const files = ["src/template.html", ...["app.js","modules/state.js","modules/ui-utils.js","modules/audio.js","modules/motion.js","modules/srs.js","modules/pwa.js","modules/events.js","modules/tabs/vocab-tab.js","modules/tabs/quiz-tab.js","modules/tabs/cheques-tab.js","modules/tabs/calc-tab.js","modules/tabs/reading-tab.js","modules/tabs/writing-tab.js","modules/tabs/grammar-tab.js","modules/tabs/plan-tab.js"].map(f => "src/" + f), "tools/build.mjs", "tools/validate-app.mjs"];
const blobs = files.map(f => fs.readFileSync(f, "utf8"));
const trulyDead = [], kept = [];
candidates.forEach(cls => {
  if ([...skip].some(p => cls.startsWith(p))) { kept.push(cls + " [dynamic-prefix]"); return; }
  const any = blobs.some(b => b.includes(cls));
  (any ? kept : trulyDead).push(cls);
});
console.log("TRULY DEAD (0 substring refs):", trulyDead.length);
console.log(trulyDead.join(", "));
console.log("\nKEPT:", kept.length);
