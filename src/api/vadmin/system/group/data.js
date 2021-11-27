import request from "@/utils/request";

// Get list data group
export function listGroup(query) {
  return request({
    url: "/admin/system/group/",
    method: "get",
    params: query
  });
}

// Get detail data group
export function getGroup(bookId) {
  return request({
    url: "/admin/system/group/" + bookId + "/",
    method: "get"
  });
}

// Add data group
export function addGroup(data) {
  return request({
    url: "/admin/system/group/",
    method: "post",
    data: data
  });
}

// Update data group
export function updateGroup(data) {
  return request({
    url: "/admin/system/group/" + data.id + "/",
    method: "put",
    data: data
  });
}

// Delete data group
export function delGroup(bookId) {
  return request({
    url: "/admin/system/group/" + bookId + "/",
    method: "delete"
  });
}

// Export data
export function exportGroup(query) {
  return request({
    url: "/admin/system/group/export/",
    method: "get",
    params: query
  });
}

// Clear cache
export function clearCache() {
  return request({
    url: "/admin/system/group/clearCache/",
    method: "delete"
  });
}

