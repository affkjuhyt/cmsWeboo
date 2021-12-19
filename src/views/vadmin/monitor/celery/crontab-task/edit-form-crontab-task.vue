<template>
  <small-dialog
    ref="dialog"
    v-model="dialogVisible"
    :dialog-title="dialogTitle"
    :width="width"
    icon="svg:icon-interface"
    @confirm="handleSubmit"
    @closed="dialogClose"
    @opened="dialogOpen"
  >
    <el-form ref="form" v-loading="loading" :model="form" :size="$ELEMENT.size" label-width="150px">
      <el-form-item v-show="false" prop="instanceId" label="instanceId" style="width: 250px;">
        <el-input v-model="form.instanceId" readonly />
      </el-form-item>
      <el-form-item prop="minute" label="Phút:" label-width="128px">
        <el-input v-model="form.minute" placeholder="Mặc định: * " />
      </el-form-item>
      <el-form-item prop="hour" label="Giờ:" label-width="128px">
        <el-input v-model="form.hour" placeholder="Mặc định: * " />
      </el-form-item>
      <el-form-item prop="day_of_week" label="Ngày trong tuần" label-width="128px">
        <el-input v-model="form.day_of_week" placeholder="Mặc định: * " />
      </el-form-item>
      <el-form-item prop="day_of_month" label="Ngày trong tháng" label-width="128px">
        <el-input v-model="form.day_of_month" placeholder="Mặc định: * " />
      </el-form-item>
      <el-form-item prop="month_of_year" label="Tháng trong năm" label-width="128px">
        <el-input v-model="form.month_of_year" placeholder="Mặc định: * " />
      </el-form-item>
    </el-form>
  </small-dialog>
</template>
<script>
import * as SyncDataApi from "@/api/vadmin/monitor/celery";
export default {
  props: {
    entity: { type: Object, default: null },
    value: { type: Boolean, default: null },
    create: { type: Boolean, default: false },
    width: { type: String, default: "50%" },
    tags: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      form: {
        instanceId: "",
        minute: "*",
        hour: "*",
        day_of_week: "*",
        day_of_month: "*",
        month_of_year: "*"
      }
    };
  },
  computed: {
    dialogTitle() {
      return this.create ? "Thời gian tác vụ mới" : "Chỉnh sửa thời gian tác vụ";
    }
  },
  watch: {
    value(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("input", val);
    }
  },
  created() {
  },
  methods: {
    dialogOpen() {
      if (!this.create) {
        this.form = { ...this.entity };
      }
    },
    handleSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          const data = { ...this.form };
          console.log(this.form);
          if (this.create) {
            delete data["instanceId"];
            SyncDataApi.createCrontabSchedule(data).then(response => {
              this.loading = false;
              this.$emit("success", response.data);
              this.dialogClose();
              this.msgSuccess("Thêm thành công!");
            }).catch(() => {
              this.loading = false;
            });
          } else {
            SyncDataApi.updateCrontabSchedule(data).then(response => {
              this.$emit("success", response.data);
              this.loading = false;
              this.msgSuccess("Hoàn thành cập nhật!");
              this.dialogClose();
            }).catch(() => {
              this.loading = false;
            });
          }
        } else {
          return false;
        }
      });
    },
    dialogClose() {
      this.$refs["form"].resetFields();
      this.$parent.initData();
      this.dialogVisible = false;
    }
  }
};
</script>

