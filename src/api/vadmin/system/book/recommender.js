import request from "@/utils/request";

// listRecommender
export function listRecommender(userId) {
  return request({
    url: "/rec/cb/user/" + userId + "/",
    method: "get"
  });
}

export function listSuggest(bookId) {
  return request({
    url: "/rec/cb/item/" + bookId + "/",
    method: "get"
  });
}

export function listAssociation(bookId) {
  return request({
    url: "/rec/association_rule/" + bookId + "/",
    method: "get"
  });
}

export function listPopular(userId) {
  return request({
    url: "/rec/pop/user/" + userId + "/",
    method: "get"
  });
}
