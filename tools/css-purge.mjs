import fs from "node:fs";

const DEAD = new Set(["num-rules","num-rule","number-rules-panel","quiz-hero-header","cheque-mockup-wrapper","decomposer-output-box","decomposer-result-fr","decomposer-result-ar","grammar-rule-box","grammar-warn-box","verb-tab-btn","btn-copy","day-task-checkbox","phrase-item-card","tab-nav-bar"]);

function blockIsDead(prelude) {
  const sels = prelude.split(",").map(s => s.trim()).filter(Boolean);
  return sels.length > 0 && sels.every(sel => {
    const classes = [...sel.matchAll(/\.([a-zA-Z_-][\w-]*)/g)].map(m => m[1]);
    // must have >=1 class, all classes dead, and no bare-element selectors beyond html/body/*
    const hasNonClassSel = /[a-zA-Z][\w-]*(\s*[>+~,:{]|$)/.test(sel.replace(/\.[\w-]+/g, "").replace(/::?[a-z-]+\(?[^)]*\)?/g, "")) && !/^[\s>*+~]*$/.test(sel.replace(/\.[\w-]+/g, ""));
    return classes.length >= 1 && classes.every(c => DEAD.has(c)) && !hasNonClassSel;
  });
}

function strip(css, file) {
  let out = "", i = 0;
  while (i < css.length) {
    const brace = css.indexOf("{", i);
    if (brace < 0) { out += css.slice(i); break; }
    const prelude = css.slice(i, brace);
    // find matching close brace
    let depth = 1, j = brace + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const body = css.slice(brace + 1, j - 1);
    const cleanPrelude = prelude.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (cleanPrelude.startsWith("@media") || cleanPrelude.startsWith("@supports")) {
      out += prelude + "{" + strip(body, file) + "}";
    } else if (blockIsDead(cleanPrelude)) {
      // drop entire block
    } else {
      out += prelude + "{" + body + "}";
    }
    i = j;
  }
  return out;
}

["md3-theme","components","motion"].forEach(f => {
  const p = `src/styles/${f}.css`;
  const before = fs.statSync(p).size;
  const cleaned = strip(fs.readFileSync(p, "utf8"), f)
    .replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(p, cleaned);
  console.log(`${f}.css ${(before/1024).toFixed(1)}KB -> ${(cleaned.length/1024).toFixed(1)}KB`);
});
