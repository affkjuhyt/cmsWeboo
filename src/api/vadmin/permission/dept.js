import request from "@/utils/request";

export function listDept(query) {
  return request({
    url: "/admin/permission/dept/",
    method: "get",
    params: query
  });
}

export function listDeptExcludeChild(deptId) {
  return request({
    url: "/admin/permission/dept/exclude/" + deptId + "/",
    method: "get"
  });
}

export function getDept(deptId) {
  return request({
    url: "/admin/permission/dept/" + deptId + "/",
    method: "get"
  });
}

export function treeselect() {
  return request({
    url: "/admin/permission/dept/treeselect/?status=1",
    method: "get"
  });
}

export function roleDeptTreeselect(roleId) {
  return request({
    url: "/admin/permission/dept/roleDeptTreeselect/" + roleId + "/?status=1",
    method: "get"
  });
}

export function addDept(data) {
  return request({
    url: "/admin/permission/dept/",
    method: "post",
    data: data
  });
}

export function updateDept(data) {
  return request({
    url: "/admin/permission/dept/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delDept(deptId) {
  return request({
    url: "/admin/permission/dept/" + deptId + "",
    method: "delete"
  });
}
