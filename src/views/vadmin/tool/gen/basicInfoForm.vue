<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="Tên bảng" prop="tableName">
          <el-input v-model="info.tableName" placeholder="Vui lòng nhập tên bảng" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Bảng mô tả" prop="tableComment">
          <el-input v-model="info.tableComment" placeholder="Vui lòng nhập bảng mô tả" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="Tên lớp thực thể" prop="className">
          <el-input v-model="info.className" placeholder="Tên lớp" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Tác giả" prop="functionAuthor">
          <el-input v-model="info.functionAuthor" placeholder="Vui lòng nhập" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="Miêu tả" prop="remark">
          <el-input v-model="info.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
export default {
  name: "BasicInfoForm",
  props: {
    info: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      rules: {
        tableName: [
          { required: true, message: "Vui lòng nhập tên bảng", trigger: "blur" }
        ],
        tableComment: [
          { required: true, message: "Vui lòng nhập mô tả bảng", trigger: "blur" }
        ],
        className: [
          { required: true, message: "Vui lòng nhập tên lớp thực thể", trigger: "blur" }
        ],
        functionAuthor: [
          { required: true, message: "Vui lòng nhập tác giả", trigger: "blur" }
        ]
      }
    };
  }
};
</script>
