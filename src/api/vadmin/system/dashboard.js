import request from "@/utils/request";

export function getDashboard() {
  return request({
    url: "/admin/system/dashboard/",
    method: "get"
  });
}
