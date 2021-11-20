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
    <el-form ref="form" v-loading="loading" :model="form" :size="$ELEMENT.size" label-width="120px">
      <el-form-item v-show="false" prop="instanceId" label="instanceId" style="width: 200px;">
        <el-input v-model="form.instanceId" readonly />
      </el-form-item>
      <el-form-item prop="every" label="Tần số:">
        <el-input-number v-model="form.every" :min="1" label="Tần số" />
      </el-form-item>
      <el-form-item prop="period" label="Khoảng thời gian:">
        <el-select v-model="form.period" placeholder="Vui lòng chọn">
          <el-option
            v-for="(item,index) in lists"
            :key="index.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
      lists: [
        { label: "ngày", value: "days" },
        { label: "giờ", value: "hours" },
        { label: "phút", value: "minutes" },
        { label: "giây", value: "seconds" }
      ],
      loading: false,
      dialogVisible: false,
      form: {
        instanceId: "",
        every: 1,
        period: "",
        title: ""
      }
    };
  },
  computed: {
    dialogTitle() {
      return this.create ? "Tần suất nhiệm vụ mới" : "Chỉnh sửa tần suất tác vụ";
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
            SyncDataApi.createIntervalschedule(data).then(response => {
              this.loading = false;
              this.$emit("success", response.data);
              this.dialogClose();
              this.msgSuccess("新增成功!");
            }).catch(() => {
              this.loading = false;
            });
          } else {
            SyncDataApi.updateIntervalschedule(data).then(response => {
              this.$emit("success", response.data);
              this.loading = false;
              this.msgSuccess("更新成功!");
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

