import request from "@/utils/request";

export function listRole(query) {
  return request({
    url: "/admin/permission/role/",
    method: "get",
    params: query
  });
}

export function getRole(roleId) {
  return request({
    url: "/admin/permission/role/" + roleId + "/",
    method: "get"
  });
}

export function addRole(data) {
  return request({
    url: "/admin/permission/role/",
    method: "post",
    data: data
  });
}

export function updateRole(data) {
  return request({
    url: "/admin/permission/role/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function dataScope(data) {
  return request({
    url: "/admin/permission/role/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  };
  return request({
    url: "/admin/permission/role/changeStatus/",
    method: "put",
    data: data
  });
}

export function delRole(roleId) {
  return request({
    url: "/admin/permission/role/" + roleId + "/",
    method: "delete"
  });
}

export function exportRole(query) {
  return request({
    url: "/admin/permission/role/export/",
    method: "get",
    params: query
  });
}
