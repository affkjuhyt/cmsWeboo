import request from "@/utils/request";

export function getDashboard() {
  return request({
    url: "/admin/system/dashboard/",
    method: "get"
  });
}

export function getPieChart() {
  return request({
    url: "/admin/system/piechart/",
    method: "get"
  });
}

export function getBarChart() {
  return request({
    url: "/admin/system/barchart/",
    method: "get"
  });
}

export function getBookBarChart() {
  return request({
    url: "admin/system/book/barchart",
    method: "get"
  });
}
