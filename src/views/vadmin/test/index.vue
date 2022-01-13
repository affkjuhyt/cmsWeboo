<template>
  <div>
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
      <el-form-item label="Lựa chọn thả xuống" prop="field102">
        <el-select v-model="formData.field102" placeholder="Xin vui lòng chọnLựa chọn thả xuống" clearable :style="{width: '100%'}">
          <el-option v-for="(item, index) in field102Options" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Số điện thoại" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="Vui lòng nhập số điện thoại" :maxlength="11" show-word-limit clearable prefix-icon='el-icon-mobile' :style="{width: '100%'}"></el-input>
      </el-form-item>
      <el-form-item label="Tính tiền" prop="field101">
        <el-input-number v-model="formData.field101" placeholder="Tính tiền"></el-input-number>
      </el-form-item>
      <el-form-item label="Con trượt" prop="field103" required>
        <el-slider v-model="formData.field103" :step="1" :max="100"></el-slider>
      </el-form-item>
      <el-form-item label="Chọn ngày" prop="field104">
        <el-date-picker v-model="formData.field104" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :style="{width: '100%'}" placeholder="Vui lòng chọnChọn ngày" clearable></el-date-picker>
      </el-form-item>
      <el-form-item label="Lựa chọn màu sắc" prop="field106" required>
        <el-color-picker v-model="formData.field106" size="medium"></el-color-picker>
      </el-form-item>
      <el-form-item label="Lựa chọn thời gian" prop="field105">
        <el-time-picker v-model="formData.field105" format="HH:mm:ss" value-format="HH:mm:ss" :picker-options='{"selectableRange":"00:00:00-23:59:59"}' :style="{width: '100%'}" placeholder="Vui lòng chọnLựa chọn thời gian" clearable></el-time-picker>
      </el-form-item>
      <el-form-item size="large">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  components: {},
  props: [],
  data() {
    return {
      formData: {
        field102: undefined,
        mobile: "",
        field101: undefined,
        field103: 0,
        field104: null,
        field106: null,
        field105: null
      },
      rules: {
        field102: [{
          required: true,
          message: "Xin vui lòng chọn Lựa chọn thả xuống",
          trigger: "change"
        }],
        mobile: [{
          required: true,
          message: "Vui lòng nhập số điện thoại",
          trigger: "blur"
        }, {
          pattern: /^1(3|4|5|7|8|9)\d{9}$/,
          message: "Số điện thoại không đúng định dạng",
          trigger: "blur"
        }],
        field101: [{
          required: true,
          message: "Tính tiền",
          trigger: "blur"
        }],
        field104: [{
          required: true,
          message: "Vui lòng chọnChọn ngày",
          trigger: "change"
        }],
        field105: [{
          required: true,
          message: "Vui lòng chọnLựa chọn thời gian",
          trigger: "change"
        }]
      },
      field102Options: [{
        "label": "Phương án nhất",
        "value": 1
      }, {
        "label": "Phương án hai",
        "value": 2
      }]
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    submitForm() {
      this.$refs["elForm"].validate(valid => {
        if (!valid) return;
      });
    },
    resetForm() {
      this.$refs["elForm"].resetFields();
    }
  }
};

</script>
<style>
</style>

<!--提交表单-->
