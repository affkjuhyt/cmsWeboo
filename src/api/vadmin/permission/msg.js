import request from "@/utils/request";

export function getList(query) {
  return request({
    url: "/admin/system/config/",
    method: "get",
    params: query
  });
}

export function getDesc(configId) {
  return request({
    url: "/admin/system/config/" + configId + "/",
    method: "get"
  });
}

// export function getConfigKey(configKey) {
//   return request({
//     url: '/admin/system/config/configKey/' + configKey + '/',
//     method: 'get'
//   })
// }

export function addMsg(data) {
  return request({
    url: "/admin/system/config/",
    method: "post",
    data: data
  });
}

export function updateMsg(data) {
  return request({
    url: "/admin/system/config/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delMsg(configId) {
  return request({
    url: "/admin/system/config/" + configId + "/",
    method: "delete"
  });
}

export function exportMsg(query) {
  return request({
    url: "/admin/system/config/export/",
    method: "get",
    params: query
  });
}
