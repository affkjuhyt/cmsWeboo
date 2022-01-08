<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="120px">
    <el-form-item label="Tài khoản" prop="username">
      <el-input v-model="user.username" />
    </el-form-item>
    <el-form-item label="Số điện thoại" prop="phone_number">
      <el-input v-model="user.mobile" maxlength="11" />
    </el-form-item>
    <el-form-item label="Email" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="Giới tính">
      <el-radio-group v-model="user.gender">
        <el-radio
          v-for="(dict,index) in sexOptions"
          :key="index"
          :label="dict.dictValue"
        >{{ dict.dictLabel }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">Gửi</el-button>
      <el-button type="danger" size="mini" @click="close">Đóng</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from "@/api/vadmin/permission/user";

export default {
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      rules: {
        username: [
          { required: true, message: "Không được để trống", trigger: "blur" }
        ],
        email: [
          { required: true, message: "Không được để trống", trigger: "blur" },
          {
            type: "email",
            message: "'Vui lòng nhập email chính xác",
            trigger: ["blur", "change"]
          }
        ],
        mobile: [
          { required: true, message: "Không được để trống", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "Định dạng không đúng",
            trigger: "blur"
          }
        ]
      },
      sexOptions: []
    };
  },
  created() {
    this.getDicts("sys_user_sex").then(response => {
      this.sexOptions = response.data;
    });
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateUserProfile(this.user).then(response => {
            this.msgSuccess("Sửa đổi thành công");
          });
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
