import axios from "axios";
import { getToken } from "@/utils/auth";

const mimeMap = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip"
};

const baseUrl = process.env.VUE_APP_BASE_API;
export function downLoadZip(str, filename) {
  var url = baseUrl + str;
  axios({
    method: "get",
    url: url,
    responseType: "blob",
    headers: { "Authorization": "Bearer " + getToken() }
  }).then(res => {
    resolveBlob(res, mimeMap.zip);
  });
}
/**
 * @param {*} res
 * @param {String} mimeType
 */
export function resolveBlob(res, mimeType) {
  const aLink = document.createElement("a");
  var blob = new Blob([res.data], { type: mimeType });
  var patt = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
  var contentDisposition = decodeURI(res.headers["content-disposition"]);
  var result = patt.exec(contentDisposition);
  var fileName = result[1];
  fileName = fileName.replace(/\"/g, "");
  aLink.href = URL.createObjectURL(blob);
  aLink.setAttribute("download", fileName);
  document.body.appendChild(aLink);
  aLink.click();
  document.body.appendChild(aLink);
}
