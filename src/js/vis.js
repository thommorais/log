'use strict';

var Log = window.Log || {};
Log.vis = {

  /**
   * Display line visualisation
   * @param {Object[]} d - Line data
   * @param {Object} c - Container
   */
  line(d, c) {
    if (d === undefined || c === undefined) return;

    const l = d.length

    if (typeof d !== 'object' || l === 0) return;
    if (typeof c !== 'object' || c === null) return;

    // Generate rows
    for (let i = 0; i < l; i++) {
      const row = document.createElement('div');
      row.className = 'db wf sh1 mt2 mb3';
      c.appendChild(row);

      if (d[i].length === 0) continue;

      // Generate entries
      for (let o = 0, ol = d[i].length; o < ol; o++) {
        const ent = document.createElement('div');
        ent.className = 'psr t0 hf mb2 lf';
        ent.style.backgroundColor = d[i][o].col;
        ent.style.marginLeft = d[i][o].mg;
        ent.style.width = d[i][o].wd;
        row.appendChild(ent);
      }
    }
  },

  /**
   * Display a bar visualisation
   * @param {Object[]} d - Bar data
   * @param {Object} c - Container
   * @param {boolean} [lines] - Lines
   */
  bar(d, c, lines = true) {
    lines && Log.vis.gridLines(c);

    if (d === undefined || c === undefined) return;

    const l = d.length

    if (typeof d !== 'object' || l === 0) return;
    if (typeof c !== 'object' || c === null) return;

    const width = `${100 / Log.config.ui.view}%`;

    // Generate columns
    for (let i = 0; i < l; i++) {
      const col = document.createElement('div');
      col.className = 'dib psr hf';
      col.style.width = width;
      c.appendChild(col);

      if (d[i].length === 0) continue;

      // Generate entries
      for (let o = 0, ol = d[i].length; o < ol; o++) {
        const ent = document.createElement('div');
        ent.style.backgroundColor = d[i][o].col;
        ent.style.bottom = d[i][o].pos;
        ent.style.height = d[i][o].wh;
        ent.className = 'psa sw1';
        col.appendChild(ent);
      }
    }
  },

  /**
   * Display a day chart
   * @param {Object} [d] - Date
   * @param {Object} [con] - Container
   */
  day(d = new Date(), c = dyc) {
    if (typeof d !== 'object') return;
    if (typeof c !== 'object' || c === null) return;

    const ent = d in entByDateCache ?
      entByDateCache[d] : Log.data.entByDate(d);

    if (ent.length === 0) return;

    let cl = '';
    switch (Log.config.ui.colourMode) {
      case 'sector':
        cl = 'sCol';
        break;
      case 'project':
        cl = 'pCol';
        break;
      default:
        cl = Log.config.ui.colour;
        break;
    }

    let lw = 0; // Last width
    let lp = 0; // Last percentage

    // Generate entries
    for (let i = 0, l = ent.length; i < l; i++) {
      // Exclude ongoing entry
      if (ent[i].e === undefined) continue;

      const wd = ent[i].dur * 3600 / 86400 * 100;
      const en = document.createElement('a');
      const dp = Log.utils.calcDP(ent[i].s);

      en.style.backgroundColor = ent[i][cl] || cl;
      en.style.marginLeft = `${dp - (lw + lp)}%`;
      en.style.width = `${wd}%`;
      en.className = 'hf lf';

      c.appendChild(en);

      lw = wd;
      lp = dp;
    }
  },

  /**
   * Display peak days chart
   * @param {number} m - Hours (0) or days (1)
   * @param {Object[]} p - Peaks
   * @param {Object} c - Container
   */
  peakChart(m, p, c) {
    if (m === undefined || p === undefined || c === undefined) return;

    const l = p.length

    if (typeof m !== 'number' || m < 0 || m > 1) return;
    if (typeof p !== 'object' || l === 0) return;
    if (typeof c !== 'object' || c === null) return;

    const now = m === 0 ? (new Date()).getHours() : (new Date()).getDay();
    const max = Math.max(...p);
    const wid = `${100 / l}%`;

    // Generate columns
    for (let i = 0; i < l; i++) {
      const col = document.createElement('div');
      const inn = document.createElement('div');
      const cor = document.createElement('div');

      col.className = 'dib hf psr';
      cor.className = 'psa b0 sw1';
      inn.className = 'sw1 hf cn';

      cor.style.backgroundColor = i === now ?
        Log.config.ui.accent : Log.config.ui.colour;

      cor.style.height = `${p[i] / max * 100}%`;
      col.style.width = wid;

      inn.appendChild(cor);
      col.appendChild(inn);
      c.appendChild(col);
    }
  },

  /**
   * List sectors or projects
   * @param {number} mod - Sector (0) or project (1)
   * @param {number} val - Hours (0) or percentages (1)
   * @param {Object} con - Container
   * @param {Object[]} [ent] - Entries
   */
  list(mod, val, con, ent = Log.log) {
    if (mod === undefined || val === undefined || con === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof val !== 'number' || val < 0 || val > 1) return;
    if (typeof con !== 'object' || con === null) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    const arr = Log.data.sortValues(ent, mod, val);
    const uic = Log.config.ui.colour;
    const lhe = Log.data.lh(ent);

    let col = '';
    let wid = 0;
    let key = '';

    for (let i = 0, l = arr.length; i < l; i++) {
      if (mod === 0) {
        col = Log.palette[arr[i][0]];
        wid = Log.data.lh(Log.data.entBySec(arr[i][0], ent)) / lhe * 100;
        key = 'sec';
      } else {
        col = Log.projectPalette[arr[i][0]];
        wid = Log.data.lh(Log.data.entByPro(arr[i][0], ent)) / lhe * 100;
        key = 'pro';
      }

      if (Log.config.ui.colourMode === 'none') col = uic;

      const nam = document.createElement('span');
      const dur = document.createElement('span');
      const bar = document.createElement('div');
      const itm = document.createElement('li');

      itm.className = 'mb4 c-pt';
      itm.setAttribute('onclick', `Log.detail.${key}('${arr[i][0]}')`);

      nam.className = 'dib xw6 elip';
      nam.innerHTML = arr[i][0];

      dur.className = 'rf';
      dur.innerHTML = arr[i][1].toFixed(2);

      bar.className = 'sh1';
      bar.style.backgroundColor = col || uic;
      bar.style.width = `${wid}%`;

      itm.appendChild(nam);
      itm.appendChild(dur);
      itm.appendChild(bar);
      con.appendChild(itm);
    }
  },

  /**
   * Display a focus distribution bar
   * @param {number} mod - Sector (0) or project (1)
   * @param {Object[]} [ent] - Entries
   * @param {Object} [con] - Container
   */
  focusBar(mod, ent = Log.log, con = focusBar) {
    if (mod === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const val = Log.data.sortValues(ent, mod, 1);

    // console.time('a')
    for (let i = 0, l = val.length; i < l; i++) {
      const div = document.createElement('div');
      div.className = 'hf lf';
      div.style.backgroundColor = (
        mod === 0 ?
          Log.palette[val[i][0]] : Log.projectPalette[val[i][0]]
      ) || Log.config.ui.colour;
      div.style.width = `${val[i][1]}%`;
      con.appendChild(div);
    }
    // console.timeEnd('a')
  },

  /**
   * Create legend
   * @param {number} mod - Sector (0) or project (1)
   * @param {Object[]} [ent] - Entries
   * @param {string} [con] - Container
   */
  legend(mod, ent = Log.log, con = document.getElementById('legend')) {
    if (mod === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const val = Log.data.sortValues(ent, mod, 1);
    const uic = Log.config.ui.colour;

    for (let i = 0, l = val.length; i < l; i++) {
      const col = (
        mod === 0 ? Log.palette[val[i][0]] : Log.projectPalette[val[i][0]]
      ) || uic;

      const ico = document.createElement('div');
      const inf = document.createElement('div');
      const itm = document.createElement('li');

      itm.className = 'c4 mb3 f6 lhc';

      ico.className = 'dib sh3 sw3 mr2 brf vm';
      ico.style.backgroundColor = col;

      inf.className = 'dib vm';
      inf.innerHTML = `${val[i][1].toFixed(2)}% ${val[i][0]}`;

      itm.appendChild(ico);
      itm.appendChild(inf);
      con.appendChild(itm);
    }
  },

  /**
   * Display a focus chart
   * @param {number} mod - Sector (0) or project (1)
   * @param {Object[]} [ent] - Entries
   * @param {string} [con] - Container
   */
  focusChart(mod, ent = Log.log, con = document.getElementById('focusChart')) {
    if (mod === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const set = Log.data.sortEnt(ent);
    const wid = `${100 / set.length}%`;
    const uic = Log.config.ui.colour;

    for (let i = 0, l = set.length; i < l; i++) {
      const list = mod === 0 ?
        Log.data.listSec(set[i]) :
        Log.data.listPro(set[i]);

      const col = document.createElement('div');
      const inn = document.createElement('div');

      col.className = 'dib hf';
      col.style.width = wid;

      inn.className = 'psa sw1 b0';
      inn.style.backgroundColor = uic;
      inn.style.height = `${list === undefined ? 0 : 1 / list.length * 100}%`;

      col.appendChild(inn);
      con.appendChild(col);
    }
  },

  /**
   * Create chart lines
   * @param {Object} c - Container
   */
  gridLines(c) {
    if (c === undefined) return;
    if (typeof c !== 'object' || c === null) return;

    c.innerHTML = '';

    const d1 = document.createElement('div');
    const d2 = document.createElement('div');
    const d3 = document.createElement('div');
    const d4 = document.createElement('div');
    const d5 = document.createElement('div');
    const cl = 'psa wf bt o1';

    d5.className = `${cl} b0`;
    d4.className = cl;
    d3.className = cl;
    d2.className = cl;
    d1.className = cl;

    d4.style.top = '75%';
    d3.style.top = '50%';
    d2.style.top = '25%';

    c.appendChild(d1);
    c.appendChild(d2);
    c.appendChild(d3);
    c.appendChild(d4);
    c.appendChild(d5);
  },

  /**
   * Create meter lines
   * @param {Object} c - Container
   */
  meterLines(c) {
    if (c === undefined) return;
    if (typeof c !== 'object') return;
    for (let i = 0, l = 0; i < 24; i++) {
      l += 4.17;
      const d = document.createElement('div');
      d.className = `psa ${i % 2 === 0 ? 'h5' : 'hf'} br o7`;
      d.style.left = `${l}%`;
      c.appendChild(d);
    }
  },
};
