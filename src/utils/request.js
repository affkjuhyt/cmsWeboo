import axios from "axios";
import { Notification, MessageBox, Message } from "element-ui";
import { getToken } from "@/utils/auth";
import errorCode from "@/utils/errorCode";

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
});
service.interceptors.request.use(config => {
  const isToken = (config.headers || {}).isToken === false;
  if (getToken() && !isToken) {
    config.headers["Authorization"] = "Bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  if (config.method === "get" && config.params) {
    let url = config.url + "?";
    for (const propName of Object.keys(config.params)) {
      const value = config.params[propName];
      var part = encodeURIComponent(propName) + "=";
      if (value !== null && typeof (value) !== "undefined") {
        if (typeof value === "object") {
          for (const key of Object.keys(value)) {
            const params = propName + "[" + key + "]";
            var subPart = encodeURIComponent(params) + "=";
            url += subPart + encodeURIComponent(value[key]) + "&";
          }
        } else {
          url += part + encodeURIComponent(value) + "&";
        }
      }
    }
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  return config;
}, error => {
  console.log(error);
  Promise.reject(error);
});

service.interceptors.response.use(res => {
  const code = res.data.code || 200;
  const msg = errorCode[code] || res.data.msg || errorCode["default"];
  if (code === 401) {
    MessageBox.confirm("Trạng thái đăng nhập đã hết hạn, bạn có thể ở lại trang này hoặc đăng nhập lại", "Gợi ý", {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      type: "warning"
    }
    ).then(() => {
      location.href = "/index";
    });
  } else if (code === 500) {
    Message({
      message: msg,
      type: "error"
    });
    return Promise.reject(new Error(msg));
  } else if (code !== 200) {
    Notification.error({
      title: msg
    });
    return Promise.reject("error");
  } else {
    return res.data;
  }
},
error => {
  console.log("err" + error);
  let { message } = error;
  if (message == "Network Error") {
    message = "Kết nối API không ổn định";
  } else if (message.includes("timeout")) {
    message = "Kết nối API hết hạn";
  } else if (message.includes("Request failed with status code")) {
    message = "Kết nối lỗi" + message.substr(message.length - 3) + "异常";
  }
  Message({
    message: message,
    type: "error",
    duration: 5 * 1000
  });
  return Promise.reject(error);
}
);

export default service;
