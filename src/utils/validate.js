/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ["admin", "editor"];
  return valid_map.indexOf(str.trim()) >= 0;
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === "string" || str instanceof String) {
    return true;
  }
  return false;
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === "undefined") {
    return Object.prototype.toString.call(arg) === "[object Array]";
  }
  return Array.isArray(arg);
}

export function getCrontabData(val) {
  if (!val || Object.keys(val).length === 0) return "";
  const week = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7" };
  let res = "";
  if (val.month_of_year !== "*") {
    res = `${val.month_of_year} tháng ${val.day_of_month} ngày ${val.hour}giờ${val.minute}phút`;
  } else if (val.day_of_month !== "*") {
    res = `Mỗi tháng ${val.day_of_month} ngày ${val.hour}giờ${val.minute}phút`;
  } else if (val.day_of_week !== "*") {
    res = `Tuần hàng ngày${week[val.day_of_week] || val.day_of_week} ${val.hour}giờ${val.minute}phút `;
  } else if (val.hour !== "*") {
    res = `Hằng ngày ${val.hour}giờ${val.minute}phút`;
  } else if (val.minute !== "*") {
    res = `Mỗi phút ${val.minute}thứ 2`;
  } else {
    res = `${val.month_of_year} tháng ${val.day_of_month} ngày ${val.hour}giờ${val.minute}phút`;
  }
  return res.replace(/\*/g, "00");
}

export function getIntervalData(val) {
  if (!val || Object.keys(val).length === 0) return "";
  const lists = { days: "ngày", hours: "giờ", seconds: "giây", minutes: "phút" };
  return `Mỗi${val.every !== 1 ? val.every : ""}${lists[val.period]}`;
}
