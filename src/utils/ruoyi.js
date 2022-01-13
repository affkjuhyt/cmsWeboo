export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if ((typeof time === "string") && (/^[0-9]+$/.test(time))) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time.replace(new RegExp(/-/gm), "/");
    }
    if ((typeof time === "number") && (time.toString().length === 10)) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") { return ["ngày", "1", "2", "3", "4", "6", "7"][value]; }
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value || 0;
  });
  return time_str;
}

export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

export function addDateRange(params, dateRange, propName) {
  const search = JSON.parse(JSON.stringify(params));
  if (dateRange != null && dateRange !== "" && dateRange.length !== 0) {
    search.as = JSON.stringify({ create_datetime__range: dateRange });
  }
  return search;
}

export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).some((key) => {
    if (String(datas[key].dictValue) === ("" + String(value))) {
      actions.push(datas[key].dictLabel);
      return true;
    }
  });
  return actions.join("");
}
export function selectDictDefault(datas) {
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].is_default === true) {
      actions.push(datas[key].dictValue);
      return true;
    }
  });
  if (!actions[0] && datas[0]) {
    actions.push(datas[0].dictValue);
  }
  return actions.join("");
}

export function selectDictLabels(datas, value, separator) {
  var actions = [];
  var currentSeparator = undefined === separator ? "," : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    Object.keys(datas).some((key) => {
      if (datas[key].dictValue == ("" + temp[val])) {
        actions.push(datas[key].dictLabel + currentSeparator);
      }
    });
  });
  return actions.join("").substring(0, actions.join("").length - 1);
}
/**
 * @param  {Blob} blob
 * @param  {String} filename
 */

function saveAs(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    var body = document.querySelector("body");

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // fix Firefox
    link.style.display = "none";
    body.appendChild(link);

    link.click();
    body.removeChild(link);

    window.URL.revokeObjectURL(link.href);
  }
}

/**
 * @param  {String} url
 * @return {cb}
 */
function getBlob(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function() {
    if (xhr.status === 200) {
      cb(xhr.response);
    }
  };
  xhr.send();
}
export function download(file_url, fileName) {
  getBlob(process.env.VUE_APP_BASE_API + file_url, function(blob) {
    saveAs(blob, fileName);
  });
}

export function sprintf(str) {
  var args = arguments; var flag = true; var i = 1;
  str = str.replace(/%s/g, function() {
    var arg = args[i++];
    if (typeof arg === "undefined") {
      flag = false;
      return "";
    }
    return arg;
  });
  return flag ? str : "";
}

export function praseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

/**
 * @param {*} data
 * @param {*} id
 * @param {*} parentId
 * @param {*} children
 * @param {*} rootId
 */
export function handleTree(data, id, parentId, children, rootId) {
  id = id || "id";
  parentId = parentId || "parentId";
  children = children || "children";
  function NumCompare(a, b) {
    return a.orderNum - b.orderNum;
  }
  rootId = rootId || Math.min.apply(Math, data.map(item => { return item[parentId]; })) || 0;
  const cloneData = JSON.parse(JSON.stringify(data));
  const treeData = cloneData.filter(father => {
    const branchArr = cloneData.filter(child => {
      return father[id] === child[parentId];
    });
    branchArr.sort(NumCompare);
    branchArr.length > 0 ? father.children = branchArr : "";
    return father[parentId] === rootId || !father[parentId];
  });
  treeData.sort(NumCompare);
  return treeData !== "" ? treeData : data;
}
