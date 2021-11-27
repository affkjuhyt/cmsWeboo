import request from "@/utils/request";

// Get list data postgroup
export function listPostGroup(query) {
  return request({
    url: "/admin/system/post/",
    method: "get",
    params: query
  });
}

// Get detail data postgroup
export function getPostGroup(postGroupId) {
  return request({
    url: "/admin/system/post/" + postGroupId + "/",
    method: "get"
  });
}

// Add data postgroup
export function addPostGroup(data) {
  return request({
    url: "/admin/system/post/",
    method: "post",
    data: data
  });
}

// Update data postgroup
export function updatePostGroup(data) {
  return request({
    url: "/admin/system/post/" + data.id + "/",
    method: "put",
    data: data
  });
}

// Delete data postgroup
export function delPostGroup(bookId) {
  return request({
    url: "/admin/system/post/" + bookId + "/",
    method: "delete"
  });
}

// Export data
export function exportPostGroup(query) {
  return request({
    url: "/admin/system/post/export/",
    method: "get",
    params: query
  });
}

// Clear cache
export function clearCache() {
  return request({
    url: "/admin/system/post/clearCache/",
    method: "delete"
  });
}

