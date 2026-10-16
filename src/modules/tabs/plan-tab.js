import { state, saveStateToLocalStorage, initStats } from '../state.js';
import { switchTab, showToast, playHaptic } from '../ui-utils.js';

export const PLAN_MONTH_TITLES = {
  1: "الأساسيات واللغة والأرقام",
  2: "الهيكل والخرسانة · Gros œuvre",
  3: "الأشغال الثانوية والتجهيزات · Second œuvre",
  4: "التشطيبات والعزل · Finitions",
  5: "الإدارة والسلامة والطرق · Gestion",
  6: "الإتقان والمراجعة الشاملة · Maîtrise"
};

export const TAB_LABELS = {
  vocab: { text: 'مفردات', icon: '🏗️', color: 'var(--blue)' },
  quiz: { text: 'اختبار', icon: '🎯', color: '#a855f7' },
  cheques: { text: 'شيكات وأرقام', icon: '💰', color: 'var(--gold)' },
  reading: { text: 'قراءة وثيقة', icon: '📖', color: '#06b6d4' },
  writing: { text: 'تحرير نموذج', icon: '✍️', color: '#ec4899' },
  grammar: { text: 'قواعد لغوية', icon: '📚', color: '#10b981' },
  calc: { text: 'حاسبة الورش', icon: '🧮', color: '#f97316' },
  plan: { text: 'مراجعة', icon: '📅', color: '#64748b' }
};

let planMonthFilter = 'all';
let planSearchQuery = '';
let planUncompletedOnly = false;

export function handlePlanSearch() {
  const input = document.getElementById('plan-search-input');
  planSearchQuery = (input?.value || '').trim().toLowerCase();
  renderStudyPlan();
}

export function setPlanMonthFilter(month, btnEl) {
  planMonthFilter = month;
  document.querySelectorAll('#plan-month-filters-bar .lvl-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderStudyPlan();
}

export function togglePlanUncompletedOnly() {
  planUncompletedOnly = !planUncompletedOnly;
  const btn = document.getElementById('plan-uncompleted-toggle-btn');
  if (btn) {
    btn.classList.toggle('active-toggle', planUncompletedOnly);
    btn.innerText = planUncompletedOnly ? '✓ عرض جميع الأيام' : '⏳ المتبقية فقط';
  }
  renderStudyPlan();
}

export function toggleAllPlanMonths(open) {
  const months = [...new Set(PLAN_TASKS.map(t => t.month))];
  months.forEach(m => {
    if (open) state.planOpenMonths.add(m);
    else state.planOpenMonths.delete(m);
  });
  document.querySelectorAll('#plan-weeks-container .plan-month').forEach(el => {
    el.open = open;
  });
}

export function resetPlanProgress() {
  if (confirm('هل أنت متأكد من رغبتك في تصفير جميع الأيام المنجزة في الخطة الدراسية؟')) {
    state.checkedDays.clear();
    saveStateToLocalStorage();
    initStats();
    renderStudyPlan();
    showToast('تم تصفير تقدم الخطة الدراسية بنجاح 🔄');
  }
}

export function renderStudyPlan() {
  const container = document.getElementById('plan-weeks-container');
  if (!container) return;

  const totalDays = PLAN_TASKS.length;
  const doneDays = state.checkedDays.size;
  const remainingDays = Math.max(0, totalDays - doneDays);
  const pct = Math.round((doneDays / totalDays) * 100);

  // Update Stats in Top Card
  const totalEl = document.getElementById('plan-stat-total');
  const doneEl = document.getElementById('plan-stat-done');
  const remEl = document.getElementById('plan-stat-remaining');
  const pctEl = document.getElementById('plan-progress-percent');
  const barFill = document.getElementById('plan-progress-bar-fill');
  const progressBar = document.getElementById('plan-progressbar');

  if (totalEl) totalEl.innerText = totalDays;
  if (doneEl) doneEl.innerText = doneDays;
  if (remEl) remEl.innerText = remainingDays;
  if (pctEl) pctEl.innerText = `${pct}%`;
  if (barFill) barFill.style.width = `${pct}%`;
  if (progressBar) progressBar.setAttribute('aria-valuenow', String(pct));

  let filteredTasks = PLAN_TASKS;
  if (planMonthFilter !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.month === Number(planMonthFilter));
  }
  if (planSearchQuery) {
    filteredTasks = filteredTasks.filter(t => 
      t.desc.toLowerCase().includes(planSearchQuery) || 
      String(t.day).includes(planSearchQuery) ||
      (PLAN_MONTH_TITLES[t.month] || '').toLowerCase().includes(planSearchQuery)
    );
  }
  if (planUncompletedOnly) {
    filteredTasks = filteredTasks.filter(t => !state.checkedDays.has(t.day));
  }

  const months = [...new Set(filteredTasks.map(t => t.month))].sort((a, b) => a - b);

  if (months.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:48px 20px; color:var(--text-muted); grid-column:1/-1;">
        <div style="font-size:36px; margin-bottom:12px;">🔍</div>
        <h4 style="color:var(--text-primary); margin-bottom:6px; font-size:16px;">لم يتم العثور على أي مهام مطابقة</h4>
        <p style="font-size:13px;">جرب تغيير كلمة البحث أو فلاتر الأشهر المختارة أعلاه.</p>
      </div>
    `;
    return;
  }

  let html = '';

  months.forEach(m => {
    const monthTasks = filteredTasks.filter(t => t.month === m);
    const allMonthTasks = PLAN_TASKS.filter(t => t.month === m);
    const doneInMonth = allMonthTasks.filter(t => state.checkedDays.has(t.day)).length;
    const monthPct = Math.round((doneInMonth / allMonthTasks.length) * 100);
    const isOpen = state.planOpenMonths.has(m) || planSearchQuery.length > 0 || planMonthFilter !== 'all';

    html += `
      <details class="plan-month" data-month="${m}" ${isOpen ? 'open' : ''}>
        <summary class="plan-month-title">
          <div class="plan-month-title-left">
            <span class="plan-month-icon" aria-hidden="true">📦</span>
            <span class="plan-month-name">الشهر ${m} / Mois ${m} — ${PLAN_MONTH_TITLES[m] || ''}</span>
          </div>
          <div class="plan-month-title-right">
            <div class="plan-month-bar-wrap" title="${monthPct}% منجز">
              <div class="plan-month-bar-fill" style="width:${monthPct}%"></div>
            </div>
            <span class="plan-month-count">${doneInMonth} / ${allMonthTasks.length} يوم (${monthPct}%)</span>
          </div>
        </summary>
        <div class="plan-month-content">`;

    const weeks = [...new Set(monthTasks.map(t => t.week))].sort((a, b) => a - b);
    weeks.forEach(w => {
      const weekTasks = monthTasks.filter(t => t.week === w);
      const allWeekTasks = PLAN_TASKS.filter(t => t.week === w);
      const finishedInWeek = allWeekTasks.filter(t => state.checkedDays.has(t.day)).length;
      const isWeekComplete = finishedInWeek >= allWeekTasks.length;

      html += `
        <div class="week-card ${isWeekComplete ? 'week-complete' : ''}">
          <div class="week-title">
            <div class="week-title-heading">
              <span class="week-number-pill">الأسبوع ${w}</span>
              <span class="week-name-fr">Semaine ${w}</span>
            </div>
            <span class="week-progress-badge ${isWeekComplete ? 'badge-done' : ''}">
              ${isWeekComplete ? '✓ مكتمل' : `${finishedInWeek} / ${allWeekTasks.length} أيام`}
            </span>
          </div>
          <div class="day-tasks-list">`;

      weekTasks.forEach(task => {
        const isChecked = state.checkedDays.has(task.day);
        const meta = TAB_LABELS[task.tab] || TAB_LABELS.vocab;
        const gotoLabel = isChecked ? 'راجع النشاط' : 'ابدأ النشاط';

        html += `
          <div class="day-task-item ${isChecked ? 'checked-task' : ''}" id="plan-task-row-${task.day}">
            <div class="day-task-top">
              <div class="day-task-left">
                <input type="checkbox" class="day-checkbox" id="day-chk-${task.day}" ${isChecked ? 'checked' : ''} data-call="togglePlanDay" data-args='[${task.day}]' aria-label="إكمال نشاط اليوم ${task.day}">
                <label for="day-chk-${task.day}" class="day-badge ${isChecked ? 'badge-done' : ''}">اليوم ${task.day}</label>
                <span class="day-time-badge">⏱️ ${task.time}</span>
                <span class="day-tab-tag" style="border-color:${meta.color}40; color:${meta.color}; background:${meta.color}15;">${meta.icon} ${meta.text}</span>
              </div>
              <button type="button" class="day-goto-btn" data-call="goToPlanTab" data-args='["${task.tab}"]' aria-label="${gotoLabel} اليوم ${task.day}" title="${gotoLabel} اليوم ${task.day}">
                <span class="day-goto-label">${gotoLabel}</span>
                <span class="day-goto-arrow" aria-hidden="true">↗</span>
              </button>
            </div>
            <div class="day-desc">${task.desc}</div>
          </div>`;
      });

      html += `
          </div>
        </div>`;
    });

    html += `
        </div>
      </details>`;
  });

  container.innerHTML = html;
  container.querySelectorAll('.plan-month').forEach(monthEl => {
    monthEl.addEventListener('toggle', () => {
      const month = Number(monthEl.dataset.month);
      if (monthEl.open) state.planOpenMonths.add(month);
      else state.planOpenMonths.delete(month);
    });
  });
}

export function togglePlanDay(dayNum) {
  const row = document.getElementById(`plan-task-row-${dayNum}`);
  if (state.checkedDays.has(dayNum)) {
    state.checkedDays.delete(dayNum);
    if (row) row.classList.remove('checked-task');
  } else {
    state.checkedDays.add(dayNum);
    if (row) row.classList.add('checked-task');
    showToast(`أحسنت! أكملت نشاط اليوم ${dayNum} 👏`);
    playHaptic([15, 30, 15]);
  }
  
  saveStateToLocalStorage();
  initStats();
  
  // Wait for the CSS animation (.checkboxCheckPop 0.34s) to complete before re-rendering DOM
  setTimeout(() => {
    renderStudyPlan();
  }, 350);
}

export function goToPlanTab(tabId) {
  const tabBtn = document.getElementById(`tab-btn-${tabId}`)
    || Array.from(document.querySelectorAll('.tab-btn')).find(btn => {
      try {
        return JSON.parse(btn.dataset.args || '[]')[0] === tabId;
      } catch {
        return false;
      }
    });

  if (!tabBtn) {
    showToast('تعذر فتح النشاط، حاول مرة أخرى', 'error');
    return;
  }

  switchTab(tabId, tabBtn);
}

if (typeof window !== 'undefined') {
  window.PLAN_MONTH_TITLES = PLAN_MONTH_TITLES;
  window.TAB_LABELS = TAB_LABELS;
  window.renderStudyPlan = renderStudyPlan;
  window.togglePlanDay = togglePlanDay;
  window.goToPlanTab = goToPlanTab;
  window.handlePlanSearch = handlePlanSearch;
  window.setPlanMonthFilter = setPlanMonthFilter;
  window.togglePlanUncompletedOnly = togglePlanUncompletedOnly;
  window.toggleAllPlanMonths = toggleAllPlanMonths;
  window.resetPlanProgress = resetPlanProgress;
}
