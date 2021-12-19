import request from "@/utils/request";

export function list(query) {
  return request({
    url: "/admin/system/operation_log/",
    method: "get",
    params: query
  });
}

export function delOperationLog(operId) {
  return request({
    url: "/admin/system/operation_log/" + operId + "/",
    method: "delete"
  });
}

export function cleanOperationLog() {
  return request({
    url: "/admin/system/operation_log/clean/",
    method: "delete"
  });
}

export function exportOperationLog(query) {
  return request({
    url: "/admin/system/operation_log/export/",
    method: "get",
    params: query
  });
}
