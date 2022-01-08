import request from "@/utils/request";

export function listVulgar(query) {
  return request({
    url: "/admin/system/vulgar/",
    method: "get",
    params: query
  });
}

export function getVulgar(vulgarId) {
  return request({
    url: "/admin/system/vulgar/" + vulgarId + "/",
    method: "get"
  });
}

export function updateVulgar(data) {
  return request({
    url: "/admin/system/vulgar/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function addVulgar(data) {
  return request({
    url: "/admin/system/vulgar/",
    method: "post",
    data: data
  });
}

export function delVulgar(vulgarId) {
  return request({
    url: "/admin/system/vulgar/" + vulgarId + "/",
    method: "delete"
  });
}

// Export data
export function exportVulgar(query) {
  return request({
    url: "/admin/system/vulgar/export/",
    method: "get",
    params: query
  });
}
