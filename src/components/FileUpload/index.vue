<template>
  <div class="upload-file">
    <el-upload
      ref="upload"
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="1"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
    >
      <el-button size="mini" type="primary">Chọn tập tin zip</el-button>
      <div v-if="showTip" slot="tip" class="el-upload__tip">
        Vui lòng tải lên
        <template v-if="fileSize"> Kích thước không vượt quá <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
        <template v-if="fileType"> Định dạng là <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      </div>
    </el-upload>

    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li v-for="(file, index) in list" :key="file.uid" class="el-upload-list__item ele-upload-list__item-content">
        <el-link :href="file.url" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" type="danger" @click="handleDelete(index)">Xóa</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";

export default {
  name: "FileUpload",
  props: {
    value: [String, Object, Array],
    fileSize: {
      type: Number,
      default: 20
    },
    fileType: {
      type: Array,
      default: () => ["doc", "xls", "ppt", "txt", "pdf", "zip"]
    },
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/admin/system/savefile/",
      headers: {
        Authorization: "Bearer " + getToken()
      },
      fileList: []
    };
  },
  computed: {
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
    list() {
      let temp = 1;
      if (this.value) {
        const list = Array.isArray(this.value) ? this.value : [this.value];
        return list.map((item) => {
          if (typeof item === "string") {
            item = { name: item, url: item };
          }
          item.uid = item.uid || new Date().getTime() + temp++;
          return item;
        });
      } else {
        this.fileList = [];
        return [];
      }
    }
  },
  created() {
    this.fileList = this.list;
  },
  methods: {
    handleBeforeUpload(file) {
      if (this.fileType && this.fileType[0] !== "ALL") {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        const isTypeOk = this.fileType.some((type) => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
        if (!isTypeOk) {
          this.$message.error(`Định dạng tệp không chính xác, vui lòng tải lên${this.fileType.join("/")}định dạng tệp!`);
          return false;
        }
      }
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$message.error(`Kích thước tệp không được vượt quá ${this.fileSize} MB!`);
          return false;
        }
      }
      return true;
    },
    handleExceed() {
      this.$message.error(`Chỉ cho phép tải lên một tệp duy nhất`);
    },
    handleUploadError() {
      this.$message.error("Tải lên không thành công vui lòng cập nhật lại");
    },
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        this.$message.success("Tải lên thành công");
        this.$emit("input", res.data.file);
      } else {
        this.$message.error(res.msg);
      }
    },
    handleDelete(index) {
      this.fileList.splice(index, 1);
      this.$emit("input", "");
    },
    getFileName(name) {
      if (name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1).toLowerCase();
      } else {
        return "";
      }
    }
  }
};
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>
