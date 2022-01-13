import request from "@/utils/request";

export function listJobLog(query) {
  return request({
    url: "/monitor/jobLog/list",
    method: "get",
    params: query
  });
}

export function delJobLog(jobLogId) {
  return request({
    url: "/monitor/jobLog/" + jobLogId,
    method: "delete"
  });
}

export function cleanJobLog() {
  return request({
    url: "/monitor/jobLog/clean",
    method: "delete"
  });
}

export function exportJobLog(query) {
  return request({
    url: "/monitor/jobLog/export",
    method: "get",
    params: query
  });
}
