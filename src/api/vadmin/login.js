import request from "@/utils/request";

export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    idValueC: code,
    idKeyC: uuid
  };
  return request({
    url: "/admin/login/",
    method: "post",
    data: data
  });
}

export function getInfo() {
  return request({
    url: "/admin/getInfo/",
    method: "get"
  });
}

export function logout() {
  return request({
    url: "/admin/logout/",
    method: "post"
  });
}

export function getCodeImg() {
  return request({
    url: "/admin/captcha/refresh/",
    method: "get"
  });
}
