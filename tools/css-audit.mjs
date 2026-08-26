import fs from "node:fs";

const cssFiles = ["tokens","base","md3-theme","components","motion","mobile-nord5"];
const defined = new Map();
cssFiles.forEach(cf => {
  const css = fs.readFileSync(`src/styles/${cf}.css`, "utf8");
  const lines = css.split("\n");
  lines.forEach((line, idx) => {
    const clean = line.replace(/\/\*[\s\S]*?\*\//g, "");
    [...clean.matchAll(/\.([a-zA-Z_-][\w-]*)/g)].forEach(m => {
      if (!defined.has(m[1])) defined.set(m[1], `${cf}:${idx + 1}`);
    });
  });
});

const corpusFiles = [
  "src/template.html",
  "src/app.js","src/modules/state.js","src/modules/ui-utils.js","src/modules/audio.js",
  "src/modules/motion.js","src/modules/srs.js","src/modules/pwa.js","src/modules/events.js","src/modules/btp-math.js",
  "src/modules/tabs/vocab-tab.js","src/modules/tabs/quiz-tab.js","src/modules/tabs/cheques-tab.js",
  "src/modules/tabs/calc-tab.js","src/modules/tabs/reading-tab.js","src/modules/tabs/writing-tab.js",
  "src/modules/tabs/grammar-tab.js","src/modules/tabs/plan-tab.js",
  "tools/build.mjs","tools/validate-app.mjs"
];
const corpus = corpusFiles.map(f => fs.readFileSync(f, "utf8")).join("\n");

const dead = [];
defined.forEach((loc, cls) => {
  const esc = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`['"\`.\\s-]${esc}['"\`.\\s,{:]`);
  if (!re.test(corpus)) dead.push(`${cls}  (${loc})`);
});
console.log("defined:", defined.size, "| potentially dead:", dead.length);
fs.writeFileSync("dead-css-report.txt", dead.join("\n") + "\n");
