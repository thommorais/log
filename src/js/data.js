'use strict';

Date.prototype.addDays = function(n) {
  const d = new Date(this.valueOf());
  d.setDate(d.getDate() + n);
  return d;
};

const days = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

const entByDateCache = {};

var Log = window.Log || {};
Log.data = {

  /**
   * Parse log data
   * @param {Object[]} [ent] - Entries
   */
  parse(ent = Log.log) {
    if (typeof(ent) !== 'object' || ent.length === 0) return;
    if (typeof(ent[0]) !== 'object') return;

    const uic = user.config.ui.colour;
    const p = [];

    for (let i = 0, l = ent.length; i < l; i++) {
      const sCol = user.palette[ent[i].c] || uic;
      const pCol = user.projectPalette[ent[i].t] || uic;

      // Split entries that span across midnight
      if (
        Log.time.date(ent[i].s) !== Log.time.date(ent[i].e) &&
        ent[i].e !== undefined) {
        const a = Log.time.convert(ent[i].s);
        const b = Log.time.convert(ent[i].e);

        const e = Log.time.toHex(
          new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)
        );

        const s = Log.time.toHex(
          new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0)
        );

        p[p.length] = {
          e,
          sCol,
          pCol,
          id: i,
          s: ent[i].s,
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d,
          dur: Log.time.duration(ent[i].s, e)
        };

        p[p.length] = {
          s,
          sCol,
          pCol,
          id: i,
          e: ent[i].e,
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d,
          dur: Log.time.duration(s, ent[i].e)
        };
      } else {
        p[p.length] = {
          sCol,
          pCol,
          id: i,
          s: ent[i].s,
          e: ent[i].e,
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d,
          dur: Log.time.duration(ent[i].s, ent[i].e)
        };
      }
    }

    return p;
  },

  /**
   * Get entries by date
   * @param {Object} [d] - Date
   * @returns {Object[]} Entries under specified date
   */
  entByDate(d = new Date()) {
    if (typeof(d) !== 'object' || d.getTime() > new Date().getTime()) return;

    if (d in entByDateCache) return entByDateCache[d];

    const entries = [];

    for (let i = 0, l = Log.log.length; i < l; i++) {
      if (Log.log[i].e === undefined) continue;
      const a = Log.time.convert(Log.log[i].s);
      if (
        a.getFullYear() === d.getFullYear() &&
        a.getMonth() === d.getMonth() &&
        a.getDate() === d.getDate()
      ) {
        entries[entries.length] = Log.log[i];
      }
    }

    return entByDateCache[d] = entries;
  },

  /**
   * Get entries from a period
   * @param {Object} start - Period start
   * @param {Object} [end] - Period end
   * @returns {Object[]} Entries under specified period
   */
  entByPeriod(start, end = new Date()) {
    if (start === undefined) return;
    if (typeof(start) !== 'object') return;
    if (typeof(end) !== 'object') return;

    if (start.getTime() > end.getTime()) return;

    let entries = [];

    for (let current = start; current <= end;) {
      entries = entries.concat(Log.data.entByDate(current));
      current = current.addDays(1);
    }

    return entries;
  },

  /**
   * Get entries from the last n days
   * @param {number} [n] - Number of days
   * @returns {Object[]} Entries
   */
  recEnt(n = 1) {
    return typeof(n) !== 'number' || n < 1 ?
      undefined : Log.data.entByPeriod(new Date().addDays(-n));
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} Entries
   */
  entByDay(d, a = Log.log) {
    if (d === undefined) return;
    if (typeof(d) !== 'number' || d < 0 || d > 6) return;
    if (typeof(a) !== 'object' || a.length === 0) return;
    if (typeof(a[0]) !== 'object') return;

    return a.filter(({s, e}) => e !== undefined && Log.time.convert(s).getDay() === d);
  },

  /**
   * Get entries of a specific project
   * @param {string} p - Project
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} Entries
   */
  entByPro(p, a = Log.log) {
    if (p === undefined) return;
    if (typeof(p) !== 'string' || p.length === 0) return;
    if (typeof(a) !== 'object' || a.length === 0) return;

    return a.filter(({e, t}) => e !== undefined && t === p);
  },

  /**
   * Get entries of a specific sector
   * @param {string} s - Sector
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} Entries
   */
  entBySec(s, a = Log.log) {
    if (s === undefined) return;
    if (typeof(s) !== 'string' || s.length === 0) return;
    if (typeof(a) !== 'object' || a.length === 0) return;

    return a.filter(({e, c}) => e !== undefined && c === s);
  },

  /**
   * Sort entries by date
   * @param {Object[]} [ent] - Entries
   * @param {Object} [end] - End date
   */
  sortEnt(ent = Log.log, end = new Date()) {
    if (typeof(ent) !== 'object' || ent.length === 0) return;
    if (typeof(ent[0]) !== 'object') return;
    if (typeof(end) !== 'object') return;

    const dates = Log.time.listDates(Log.time.convert(ent[0].s), end);
    const sort = [];
    const list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      list[list.length] = Log.time.date(
        Log.time.toHex(new Date(
          dates[i].getFullYear(), dates[i].getMonth(),
          dates[i].getDate(), 0, 0, 0
        ))
      );
      sort[sort.length] = [];
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      const x = list.indexOf(Log.time.date(ent[i].s));
      if (x > -1) sort[x][sort[x].length] = ent[i];
    }

    return sort;
  },

  /**
   * Sort entries by day
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} Entries sorted by day
   */
  sortEntByDay(a = Log.log) {
    if (typeof(a) !== 'object' || a.length === 0) return;
    const s = [];
    for (let i = 0; i < 7; i++) {
      s[s.length] = Log.data.entByDay(i, a);
    }
    return s;
  },

  /**
   * Sort array of objects by values
   * @param {Object[]} ent - Entries
   * @param {number} mod - Sector (0) or project (1)
   * @param {string} hp - Hour or percentage
   * @returns {Object[]} Array of arrays sorted by values
   */
  sortValues(ent, mod, hp) {
    if (ent === undefined || mod === undefined || hp === undefined) return;
    if (typeof(ent) !== 'object' || ent.length === 0) return;
    if (typeof(mod) !== 'number' || mod < 0 || mod > 1) return;

    if (typeof hp !== 'number' || hp < 0 || hp > 1) return;

    const list = mod === 0 ? Log.data.listSec(ent) : Log.data.listPro(ent);
    const temp = [];
    const sor = [];

    for (let i = 0, l = list.length; i < l; i++) {
      const lh = mod === 0 ?
        Log.data.lh(Log.data.entBySec(list[i], ent)) :
        Log.data.lh(Log.data.entByPro(list[i], ent));
      temp[list[i]] = hp === 0 ? lh : lh / Log.data.lh(ent) * 100;
    }

    const sorted = Object.keys(temp).sort((a, b) => temp[a] - temp[b]).reverse();

    for (const key in sorted) {
      sor[sor.length] = [sorted[key], temp[sorted[key]]];
    }

    return sor;
  },

  /**
   * List projects
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} List of projects
   */
  listPro(a = Log.log) {
    if (typeof(a) !== 'object' || a.length === 0) return;

    const list = [];

    for (let i = a.length - 1; i >= 0; i--) {
      if (a[i].e !== undefined && list.indexOf(a[i].t) === -1) {
        list[list.length] = a[i].t;
      }
    }

    return list;
  },

  /**
   * List sectors
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} List of sectors
   */
  listSec(a = Log.log) {
    if (typeof(a) !== 'object' || a.length === 0) return;

    const list = [];

    for (let i = a.length - 1; i >= 0; i--) {
      if (a[i].e !== undefined && list.indexOf(a[i].c) === -1) {
        list[list.length] = a[i].c;
      }
    }

    return list;
  },

  /**
   * Get peak days
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} Peak days
   */
  peakDays(a = Log.log) {
    if (typeof(a) !== 'object' || a.length === 0) return;
    const week = [0, 0, 0, 0, 0, 0, 0];

    for (let i = a.length - 1; i >= 0; i--) {
      if (a[i].e !== undefined) {
        week[Log.time.convert(a[i].s).getDay()] += a[i].dur;
      }
    }

    return week;
  },

  /**
   * Get peak day
   * @param {Object[]} [p] - Peak days
   * @returns {string} Peak day
   */
  peakDay(p = Log.cache.pkd) {
    return typeof(p) !== 'object' || p.length === 0 ?
      '-' : days[p.indexOf(Math.max(...p))];
  },

  /**
   * Get peak hours
   * @param {Object[]} [ent] - Entries
   * @returns {Object[]} Peak hours
   */
  peakHours(ent = Log.log) {
    if (typeof(ent) !== 'object' || ent.length === 0) return;

    const hours = [
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ];

    for (let i = ent.length - 1; i >= 0; i--) {
      if (ent[i].e !== undefined) {
        let index = Log.time.convert(ent[i].s).getHours();
        const rem = ent[i].dur % 1;
        let block = ent[i].dur - rem;

        hours[index] += block - (block - 1);
        index++;

        while (block > 1) {
          if (index > 24) break;
          block--;
          hours[index++] += block - (block - 1);
        }

        hours[index++] += rem;
      }
    }

    return hours;
  },

  /**
   * Get peak hour
   * @param {Object[]} [h] - Peak hours
   * @returns {string} Peak hour
   */
  peakHour(h = Log.cache.pkh) {
    return typeof(h) !== 'object' || h.length === 0 ?
      '-' : `${h.indexOf(Math.max(...h))}:00`;
  },

  /**
   * List durations
   * @param {Object[]} [a] - Entries
   * @returns {Object[]} List of durations
   */
  listDur(a = Log.log) {
    if (typeof a !== 'object' || a.length === 0) return;

    const dur = [];

    for (let i = 0, l = a.length; i < l; i++) {
      if (a[i].e !== undefined) {
        dur[dur.length] = a[i].dur;
      }
    }

    return dur;
  },

  /**
   * Get minimum value
   * @param {Object[]} v - Values
   * @returns {number} Minimum value
   */
  min(v) {
    return typeof v !== 'object' || v === undefined ?
      '-' : v.length === 0 ? 0 : Math.min(...v);
  },

  /**
   * Get maximum value
   * @param {Object[]} v - Values
   * @returns {number} Maximum value
   */
  max(v) {
    if (v === undefined) return;
    return typeof v !== 'object' || v.length === 0 ?
      '-' : v.length === 0 ? 0 : Math.max(...v);
  },

  /**
   * Calculate average
   * @param {Object[]} v - Values
   * @returns {number} Average
   */
  avg(v) {
    if (v === undefined) return;
    return typeof v !== 'object' || v.length === 0 ?
      '-' : v.length === 0 ? 0 : Log.data.sum(v) / v.length;
  },

  /**
   * Calculate total
   * @param {Object[]} v - Values
   * @returns {number} Total
   */
  sum(v) {
    if (v === undefined) return;
    return typeof v !== 'object' || v.length === 0 ?
      0 : v.reduce((t, n) => t + n, 0);
  },

  /**
   * Calculate the total number of logged hours
   * @param {Object[]} [e] - Entries
   * @returns {number} Total logged hours
   */
  lh(e = Log.log) {
    return e.length === 0 ? 0 : Log.data.sum(Log.data.listDur(e));
  },

  /**
   * Calculate average logged hours
   * @param {Object[]} [e] - Sorted entries
   * @returns {number} Average logged hours
   */
  avgLh(e = Log.cache.sortEnt) {
    return typeof e !== 'object' || e.length === 0 ?
      0 : e.reduce((s, c) => s + Log.data.lh(c), 0) / e.length;
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]} [a] - Entries
   * @returns {number} Log percentage
   */
  lp(a = Log.log) {
    if (typeof a !== 'object') return;
    if (a.length === 0) return 0;

    const e = Log.time.convert(a[0].s);
    const d = Log.time.convert(a.slice(-1)[0].s);
    const n = Math.ceil((
      new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
      new Date(e.getFullYear(), e.getMonth(), e.getDate())
    ) / 864E5);

    return Log.data.lh(a) / (24 * (n + 1)) * 100;
  },

  /**
   * Calculate sector percentage
   * @param {string} s - Sector
   * @param {Object[]} [e] - Entries
   * @returns {number} Sector percentage
   */
  sp(s, e = Log.log) {
    if (s === undefined) return;
    if (typeof s !== 'string' || s.length === 0) return;
    if (typeof e !== 'object') return;
    return e.length === 0 ?
      0 : Log.data.lh(Log.data.entBySec(s, e)) / Log.data.lh(e) * 100;
  },

  /**
   * Calculate streak
   * @param {Object[]} [a] - Sorted entries
   * @returns {number} Streak
   */
  streak(a = Log.cache.sortEnt) {
    if (typeof a !== 'object') return;
    let streak = 0;
    if (a.length === 0) return streak;
    for (let i = 0, l = a.length; i < l; i++) {
      streak = a[i].length === 0 ? 0 : streak + 1;
    }
    return streak;
  },

  /**
   * Get an array of focus stats
   * @param {number} m - Sector (0) or project (1)
   * @param {Object[]} [s] - Sorted entries
   * @returns {Object[]} Array of focus stats
   */
  listFocus(m, s = Log.cache.sortEnt) {
    if (m === undefined) return;
    if (typeof m !== 'number' || m < 0 || m > 1) return;
    if (typeof s !== 'object' || s.length === 0) return;

    const list = [];

    for (let i = 0, l = s.length; i < l; i++) {
      if (s[i].length === 0) continue;
      const l = m === 0 ? Log.data.listSec(s[i]) : Log.data.listPro(s[i]);
      if (l === undefined) continue;
      list[list.length] = l.length === 0 ? 0 : 1 / l.length;
    }

    return list;
  },

  /**
   * Calculate project focus
   * @param {Object[]} [p] - Projects
   * @returns {number} Project focus
   */
  proFocus(p = Log.cache.pro) {
    return typeof p !== 'object' || p.length === 0 ? 0 : 1 / p.length;
  },

  forecast: {

    /**
     * Forecast sector focus
     * @returns {string} Sector focus
     */
    sf() {
      if (Log.cache.entByDay.length === 0) return '-';

      const arr = Log.data.listSec(Log.cache.entByDay);

      let f = '';
      let a = 0;

      for (let i = arr.length - 1; i >= 0; i--) {
        let x = Log.data.sp(arr[i], Log.cache.entByDay);
        if (x > a) {
          f = arr[i];
          a = x;
        }
      }

      return f;
    },

    /**
     * Forecast peak time
     * @returns {string} Peak time
     */
    pt() {
      return Log.cache.entByDay.length === 0 ?
        '-' : Log.data.peakHour(Log.data.peakHours(Log.cache.entByDay));
    },

    /**
     * Forecast log hours
     * @returns {number} Log hours
     */
    lh() {
      return Log.cache.entByDay.length === 0 ?
        '-' : Log.data.avg(Log.data.listDur(Log.cache.entByDay)) * 10;
    },

    /**
     * Forecast session duration
     * @returns {number} Session duration
     */
    sd() {
      return Log.cache.entByDay.length === 0 ?
        '-' : Log.data.avg(Log.data.listDur(Log.cache.entByDay));
    },
  },

  /**
   * Generate data for bar chart
   * @param {Object[]} [ent] - Entries
   * @returns {Object[]} Bar chart data
   */
  bar(ent = Log.log) {
    if (typeof(ent) !== 'object' || ent.length === 0) return;

    const arr = Log.data.sortEnt(ent);

    let set = [];
    let col = '';
    let lw = 0;
    let wh = 0;

    switch (Log.config.ui.colourMode) {
      case 'sector':
        col = 'sCol';
        break;
      case 'project':
        col = 'pCol';
        break;
      default:
        col = Log.config.ui.colour;
        break;
    }

    for (let i = arr.length - 1; i >= 0; i--) {
      set[i] = [];

      if (arr[i].length === 0) continue;

      for (let o = 0, ol = arr[i].length; o < ol; o++) {
        if (arr[i][o].e === undefined) continue;

        o === 0 && (lw = 0);

        wh = (Log.time.parse(arr[i][o].e) - Log.time.parse(arr[i][o].s)) /
          86400 * 100;

        set[i][set[i].length] = {
          col: arr[i][o][col] || col,
          pos: `${lw}%`,
          wh: `${wh}%`
        }

        lw += wh;
      }
    }

    return set;
  },

  /**
   * Generate data for line visualisation
   * @param {Object[]} [ent] - Entries
   * @returns {Object[]} Line visualisation data
   */
  line(ent = Log.log) {
    if (typeof(ent) !== 'object' || ent.length === 0) return;

    const arr = Log.data.sortEnt(ent);

    let set = [];
    let col = '';
    let lp = 0;

    switch (Log.config.ui.colourMode) {
      case 'project':
        col = 'pCol';
        break;
      case 'sector':
        col = 'sCol';
        break;
      default:
        col = Log.config.ui.colour;
        break;
    }

    for (let i = arr.length - 1; i >= 0; i--) {
      set[i] = [];

      if (arr[i].length === 0) continue;

      for (let o = 0, ol = arr[i].length; o < ol; o++) {
        if (arr[i][o] === undefined) continue;

        o === 0 && (lp = 0);

        const wd = arr[i][o].dur * 3600 / 86400 * 100;
        const dp = Log.utils.calcDP(arr[i][o].s);

        set[i][set[i].length] = {
          col: arr[i][o][col] || col,
          mg: `${dp - lp}%`,
          wd: `${wd}%`
        }

        lp = wd + dp;
      }
    }

    return set;
  }
};
