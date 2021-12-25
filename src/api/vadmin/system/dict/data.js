import request from "@/utils/request";

export function listData(query) {
  return request({
    url: "/admin/system/dict/data/",
    method: "get",
    params: query
  });
}

export function getData(dictCode) {
  return request({
    url: "/admin/system/dict/data/" + dictCode + "/",
    method: "get"
  });
}

export function getDicts(dictType) {
  return request({
    url: "/admin/system/dict/get/type/" + dictType + "/?status=1",
    method: "get"
  });
}

export function addData(data) {
  return request({
    url: "/admin/system/dict/data" + "/",
    method: "post",
    data: data
  });
}

export function updateData(data) {
  return request({
    url: "/admin/system/dict/data/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delData(dictCode) {
  return request({
    url: "/admin/system/dict/data/" + dictCode + "/",
    method: "delete"
  });
}

export function exportData(query) {
  return request({
    url: "/admin/system/dict/data/export/",
    method: "get",
    params: query
  });
}
