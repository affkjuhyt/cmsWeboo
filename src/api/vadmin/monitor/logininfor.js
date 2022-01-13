import request from "@/utils/request";

export function list(query) {
  return request({
    url: "/admin/system/logininfor/",
    method: "get",
    params: query
  });
}

export function delLogininfor(infoId) {
  return request({
    url: `/admin/system/logininfor/${infoId}/`,
    method: "delete"
  });
}

export function cleanLogininfor() {
  return request({
    url: "/admin/system/logininfor/clean",
    method: "delete"
  });
}

export function exportLogininfor(query) {
  return request({
    url: "/admin/system/logininfor/export",
    method: "get",
    params: query
  });
}
