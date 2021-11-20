import request from "@/utils/request";

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: "/admin/permission/menus/",
    method: "get",
    params: query
  });
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: "/admin/permission/menus/" + menuId,
    method: "get"
  });
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: "/admin/permission/menus/treeselect/?status=1",
    method: "get"
  });
}

// 根据角色ID查询菜单下拉树结构
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
