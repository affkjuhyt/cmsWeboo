import request from "@/utils/request";

export function listType(query) {
  return request({
    url: "/admin/system/dict/type/",
    method: "get",
    params: query
  });
}

export function getType(dictId) {
  return request({
    url: "/admin/system/dict/type/" + dictId + "/",
    method: "get"
  });
}

export function addType(data) {
  return request({
    url: "/admin/system/dict/type/",
    method: "post",
    data: data
  });
}

export function updateType(data) {
  return request({
    url: "/admin/system/dict/type/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delType(dictId) {
  return request({
    url: "/admin/system/dict/type/" + dictId + "/",
    method: "delete"
  });
}

export function clearCache() {
  return request({
    url: "/admin/system/dict/type/clearCache/",
    method: "delete"
  });
}

export function exportType(query) {
  return request({
    url: "/admin/system/dict/type/export/",
    method: "get",
    params: query
  });
}

export function optionselect() {
  return request({
    url: "/admin/system/dict/type/optionselect",
    method: "get"
  });
}
