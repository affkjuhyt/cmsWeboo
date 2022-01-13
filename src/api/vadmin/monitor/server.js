import request from "@/utils/request";

// Chi tiết thông tin truy vấn máy chủ
export function getServerList(params) {
  return request({
    url: "admin/monitor/server/",
    params,
    method: "get"
  });
}

export function updateServerInfo(id, data) {
  const { name, remark } = data;
  return request({
    url: `admin/monitor/server/${id}/`,
    data: {
      name,
      remark
    },
    method: "PUT"
  });
}

export function getMonitorStatusInfo() {
  return request({
    url: "admin/monitor/monitor/enabled/",
    method: "get"
  });
}

export function updateMonitorStatusInfo(params) {
  return request({
    url: "admin/monitor/monitor/enabled/",
    params,
    method: "get"
  });
}

export function cleanMonitorLog() {
  return request({
    url: "admin/monitor/monitor/clean/",
    method: "delete"
  });
}

export function getMonitorLogs(id, params) {
  return request({
    url: `admin/monitor/monitor/rate/${id}/`,
    params,
    method: "get"
  });
}

export function getServerLatestLog(id) {
  return request({
    url: `admin/monitor/monitor/info/${id}/`,
    method: "get"
  });
}
