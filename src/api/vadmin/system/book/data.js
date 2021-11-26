import request from "@/utils/request";

// Get list data book
export function listBook(query) {
  return request({
    url: "/admin/system/book/data/",
    method: "get",
    params: query
  });
}

// Get detail data
export function getBook(bookId) {
  return request({
    url: "/admin/system/book/data/" + bookId + "/",
    method: "get"
  });
}

// Add data book
export function addBook(data) {
  return request({
    url: "/admin/system/book/data/",
    method: "post",
    data: data
  });
}

// Update data book
export function updateBook(data) {
  return request({
    url: "/admin/system/book/data/" + data.id + "/",
    method: "put",
    data: data
  });
}

// Delete data book
export function delBook(bookId) {
  return request({
    url: "/admin/system/book/data/" + bookId + "/",
    method: "delete"
  });
}

// Export data
export function exportBook(query) {
  return request({
    url: "/admin/system/book/data/export/",
    method: "get",
    params: query
  });
}

// Clear cache
export function clearCache() {
  return request({
    url: "/admin/system/book/data/clearCache/",
    method: "delete"
  });
}

