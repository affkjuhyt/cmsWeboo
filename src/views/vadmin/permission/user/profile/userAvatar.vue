<template>
  <div>
    <div class="user-info-head" @click="editCropper()"><img :src="options.img" title="点击上传头像" class="img-circle img-lg"></div>
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body @opened="modalOpened">
      <el-row>
        <el-col :xs="24" :md="12" :style="{height: '350px'}">
          <vue-cropper
            v-if="visible"
            ref="cropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            @realTime="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{height: '350px'}">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img">
          </div>
        </el-col>
      </el-row>
      <br>
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button size="small">
              Tải lên
              <i class="el-icon-upload el-icon--right" />
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{span: 1, offset: 2}" :md="2">
          <el-button icon="el-icon-plus" size="small" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="el-icon-minus" size="small" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="el-icon-refresh-left" size="small" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="el-icon-refresh-right" size="small" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{span: 2, offset: 6}" :md="2">
          <el-button type="primary" size="small" @click="uploadImg()">Gửi</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import store from "@/store";
import { VueCropper } from "vue-cropper";
import { uploadAvatar } from "@/api/vadmin/permission/user";
import { addSaveFile } from "@/api/vadmin/system/savefile";

export default {
  components: { VueCropper },
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      open: false,
      visible: false,
      title: "Sửa đổi hình đại diện",
      options: {
        img: store.getters.avatar,
        autoCrop: true,
        autoCropWidth: 200,
        autoCropHeight: 200,
        fixedBox: true
      },
      previews: {}
    };
  },
  methods: {
    editCropper() {
      this.open = true;
    },
    modalOpened() {
      this.visible = true;
    },
    requestUpload() {
    },
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    rotateRight() {
      this.$refs.cropper.rotateRight();
    },
    changeScale(num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },
    beforeUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.msgError("Định dạng tệp sai, vui lòng tải lên loại hình ảnh, chẳng hạn như: tệp hậu tố JPG, PNG.");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
        };
      }
    },
    uploadImg() {
      this.$refs.cropper.getCropBlob(data => {
        const formData = new FormData();
        formData.append("file", data);
        addSaveFile(formData).then(res => {
          uploadAvatar({ avatar_url: res.data.file_url }).then(response => {
            this.open = false;
            this.options.img = process.env.VUE_APP_BASE_API + response.data.avatar;
            store.commit("SET_AVATAR", this.options.img);
            this.msgSuccess("Đã sửa đổi thành công");
            this.visible = false;
          });
        });
      });
    },
    realTime(data) {
      this.previews = data;
    }
  }
};
</script>
<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>
