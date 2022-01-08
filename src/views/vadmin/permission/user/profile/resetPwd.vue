<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="150px">
    <el-form-item label="Mật khẩu cũ" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="Mật khẩu cũ" type="password" />
    </el-form-item>
    <el-form-item label="Mật khẩu mới" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="Mật khẩu mới" type="password" />
    </el-form-item>
    <el-form-item label="Xác nhận mật khẩu" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="Điền lại mật khẩu mới" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">Gửi</el-button>
      <el-button type="danger" size="mini" @click="close">Đóng</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from "@/api/vadmin/permission/user";

export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error("Không đúng mật khẩu nhập lại"));
      } else {
        callback();
      }
    };
    return {
      test: "1test",
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      rules: {
        oldPassword: [
          { required: true, message: "Mật khẩu cũ không được để trống", trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: "Mật khẩu mới không được để trống", trigger: "blur" },
          { min: 6, max: 20, message: "Từ 6-20 kí tự", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "Xác nhận mật khẩu không được để trống", trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateUserPwd(this.user.oldPassword, this.user.newPassword).then(
            response => {
              this.msgSuccess("Cập nhật thông tin thành công");
            }
          );
        }
      });
    },
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.push({ path: "/index" });
    }
  }
};
</script>
