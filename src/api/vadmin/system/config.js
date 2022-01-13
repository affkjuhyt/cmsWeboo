import request from "@/utils/request";

export function listConfig(query) {
  return request({
    url: "/admin/system/config/",
    method: "get",
    params: query
  });
}

export function getConfig(configId) {
  return request({
    url: "/admin/system/config/" + configId + "/",
    method: "get"
  });
}

export function getConfigKey(configKey) {
  return request({
    url: "/admin/system/config/configKey/" + configKey + "/?status=1",
    method: "get"
  });
}

export function addConfig(data) {
  return request({
    url: "/admin/system/config/",
    method: "post",
    data: data
  });
}

export function updateConfig(data) {
  return request({
    url: "/admin/system/config/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delConfig(configId) {
  return request({
    url: "/admin/system/config/" + configId + "/",
    method: "delete"
  });
}

export function clearCache() {
  return request({
    url: "/admin/system/config/clearCache/",
    method: "delete"
  });
}

export function exportConfig(query) {
  return request({
    url: "/admin/system/config/export/",
    method: "get",
    params: query
  });
}
