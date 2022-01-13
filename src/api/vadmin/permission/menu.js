import request from "@/utils/request";

export function listMenu(query) {
  return request({
    url: "/admin/permission/menus/",
    method: "get",
    params: query
  });
}

export function getMenu(menuId) {
  return request({
    url: "/admin/permission/menus/" + menuId,
    method: "get"
  });
}

export function treeselect() {
  return request({
    url: "/admin/permission/menus/treeselect/?status=1",
    method: "get"
  });
}

export function roleMenuTreeselect(roleId) {
  return request({
    url: "/admin/permission/menus/roleMenuTreeselect/" + roleId + "/?status=1",
    method: "get"
  });
}

export function addMenu(data) {
  return request({
    url: "/admin/permission/menus/",
    method: "post",
    data: data
  });
}

export function updateMenu(data) {
  return request({
    url: "/admin/permission/menus/" + data.id + "/",
    method: "put",
    data: data
  });
}

export function delMenu(menuId) {
  return request({
    url: "/admin/permission/menus/" + menuId + "/",
    method: "delete"
  });
}
