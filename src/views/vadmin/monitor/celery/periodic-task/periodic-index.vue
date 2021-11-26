<template>
  <div class="app-container">
    <common-static-table
      ref="table"
      :data="detail"
      :fields="fields"
      selection
      @selection-change="handlePeriodicSelectionChange"
    >
      <template #enabled="scope">
        <el-switch
          :value="scope.values[scope.prop]"
          active-color="#13ce66"
          disabled
          inactive-color="#ff4949"
        />
      </template>
      <template #interval="scope">
        {{ getIntervalData(scope.values[`${scope.prop}_list`]) }}
      </template>
      <template #crontab="scope">
        {{ getCrontabData(scope.values[`${scope.prop}_list`]) }}
      </template>
      <template slot="button">
        <el-button
          :size="$ELEMENT.size"
          type="primary"
          title="Thêm nhiệm vụ"
          icon="el-icon-circle-plus"
          @click="handleOpenEditPeriodicForm(true)"
        >Thêm vào
        </el-button>
      </template>
      <template slot="column">
        <el-table-column fixed="right" label="Chạy" align="center" width="150">
          <template slot-scope="scope">
            <el-button
              :size="$ELEMENT.size"
              type="primary"
              title="Thực thi ngay lập tức"
              icon="el-icon-caret-right"
              circle
              @click="test(scope.row)"
            />
            <el-button
              :size="$ELEMENT.size"
              type="primary"
              title="Chỉnh sửa"
              icon="el-icon-edit"
              circle
              @click="handleOpenEditPeriodicForm(false, scope.row)"
            />
            <el-button
              :size="$ELEMENT.size"
              type="danger"
              title="Xóa"
              icon="el-icon-delete"
              circle
              @click="handleRemovePeriodicTable(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </common-static-table>
    <el-dialog :visible.sync="dialogFormVisible" title="Vui lòng xác nhận">
      <span>
        Đồng bộ hóa: {{ row.task }}
      </span>
      <br>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Hủy bỏ</el-button>
        <el-button type="primary" @click="handleOperate">Đảm bảo</el-button>
      </div>
    </el-dialog>
    <edit-form-periodic-task
      v-model="editPeriodicFormVisible"
      :entity="editPeriodic"
      :create="editPeriodicCreate"
      :periodic-data="periodicData"
      :width="'40%'"
      @success="handleSuccessEditPeriodic"
    />
  </div>
</template>

<script>
import * as SyncDataApi from "@/api/vadmin/monitor/celery";
import EditFormPeriodicTask from "./edit-form-periodic-task";

export default {
  components: { EditFormPeriodicTask },
  props: {
  },
  data() {
    return {
      fields: [
        { prop: "name", label: "Tên", show: true, unique: true },
        { prop: "task", label: "celery", show: true, width: 400 },
        { prop: "interval", label: "Tần số", show: true, search: true },
        { prop: "crontab", label: "Lập trình tác vụ", show: true, search: true, sortable: true },
        { prop: "args", label: "Tham số", show: false, search: true, sortable: true, width: 80 },
        { prop: "kwargs", label: "Tham số vị trí", show: false, search: true, sortable: true },
        { prop: "queue", label: "Xếp hàng", show: false, search: true, sortable: true },
        { prop: "exchange", label: "Trạng thái", show: false, search: true },
        { prop: "routing_key", label: "Định tuyến", show: false, search: true },
        { prop: "expires", label: "Thời hạn", show: false, search: true, type: "datetime" },
        { prop: "enabled", label: "Có mở không", show: true, search: true }
      ],
      periodicData: [],
      multipleSelection: [],
      PeriodicTagList: [],
      editPeriodic: {},
      editPeriodicFormVisible: false,
      editPeriodicCreate: false,
      modelFormVisible: false,
      modelSwaggerVisible: false,
      batchEditFormVisible: false,
      detail: [],
      dialogFormVisible: false,
      form: { name: "" },
      formLabelWidth: "120px",
      row: "",
      reqloading: false,
      task_id: ""
    };
  },
  computed: {
  },
  watch: {
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      SyncDataApi.listPeriodicTask({ pageSize: 1000 }).then((response) => {
        this.detail = response.data.results || [];
      });
    },
    handleRefresh(infos) {
      this.$refs.table.clearSelection();
      this.$emit("update");
    },
    handlePeriodicSelectionChange(infos) {
      this.multipleSelection = infos;
    },
    handleOpenEditPeriodicForm(create = false, info) {
      if (create) {
        this.editPeriodic = { periodic: this.detail.id };
      } else {
        this.editPeriodic = { ...info };
      }
      this.editPeriodicCreate = create;
      this.editPeriodicFormVisible = true;
    },
    handleRemovePeriodicTable(index, info) {
      this.$confirm("Xác nhận xóa?", "Xác nhận thông tin", {
        distinguishCancelAndClose: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy"
      }).then(() => {
        SyncDataApi.deletePeriodicTask(info.id).then(response => {
          const name = info.name ? info.name + ":" : "";
          this.msgSuccess(name + "Đã xóa thành công");
          this.initData();
        });
      });
    },
    handleSuccessEditPeriodic() {
      this.initData();
      this.$emit("update");
    },
    handleOpenModelForm() {
      this.modelFormVisible = true;
    },
    handleOpenSwagger(model = false) {
      this.modelSwaggerVisible = true;
    },
    handleBatchEdit() {
      this.batchEditFormVisible = true;
    },
    test(row) {
      this.dialogFormVisible = true;
      this.row = row;
      this.DetailMsg = "";
    },
    handleOperate() {
      this.dialogFormVisible = false;
      this.reqloading = true;
      SyncDataApi.operatesyncdata({ celery_name: this.row.task }).then(response => {
        this.task_id = response.data.task_id;
        this.msgSuccess("Thực hiện thành công!");
      });
    },
    closeView() {
      this.reqloading = false;
    }
  }
};
</script>

<style scoped>
  .el-table th {
    display: table-cell !important;
  }
</style>
