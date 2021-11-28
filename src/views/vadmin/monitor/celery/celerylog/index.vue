<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tên nhiệm vụ" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="Vui lòng nhập tên nhiệm vụ"
          clearable
          style="width: 240px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên chức năng" prop="func_name">
        <el-input
          v-model="queryParams.func_name"
          placeholder="Vui lòng nhập tên của hàm thực thi"
          clearable
          style="width: 240px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Trang thái" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Trang thái"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Thời gian thực hiện">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="Ngày bắt đầu"
          end-placeholder="Ngày cuối"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['admin:system:celery_log:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Xóa</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['admin:system:celery_log:clean:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
        >Clean</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['admin:system:celery_log:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Id" width="80" align="center" prop="id" />
      <el-table-column label="Tên" align="center" prop="name" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="Hàm thực thi" align="center" prop="func_name" :show-overflow-tooltip="true" />
      <el-table-column label="Các thông số thực thi" align="center" prop="kwargs" :show-overflow-tooltip="true" />
      <el-table-column label="Thời gian thực hiện" width="80" align="center" prop="seconds" />
      <el-table-column label="Tình trạng hoạt động" width="80" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="Kết quả nhiệm vụ" align="center" prop="result" :show-overflow-tooltip="true" />
      <el-table-column label="Ngày thi hành" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['admin:system:celerylog:get']"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row,scope.index)"
          >Chi tiết
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <detail-form-dialog
      v-if="openDetailModal"
      dialog-title="Chi tiết nhật ký thời gian"
      modal-width="700px"
      :open-detail-modal="openDetailModal"
      :form-data="form"
      :form-item="formItem"
      @closeDialog="value=>{openDetailModal=value}"
    />
  </div>
</template>

<script>
import { list, delCeleryLog, cleanCeleryLog, exportCeleryLog } from "@/api/vadmin/monitor/celery";
import DetailFormDialog from "@/components/Modal/DetailFormDialog";

const CELERY_LOG_FORM_ITEM = [
  {
    index: 1,
    label: "Số nhật ký",
    key: "id"
  },
  {
    index: 2,
    label: "Tên nhiêm vụ",
    key: "name"
  },
  {
    index: 3,
    label: "Tên hàm thực thi",
    key: "func_name",
    width: "auto"
  },
  {
    index: 4,
    label: "Các thông số thực thi",
    key: "kwargs",
    singleLine: true
  },
  {
    index: 5,
    label: "Thời gian thực hiện",
    key: "seconds"
  },
  {
    index: 6,
    label: "Tình trạng hoạt động",
    key: "status",
    labelType: "boolean",
    labelChoices: {
      false: "Thất bại",
      true: "Thông thường"
    }
  },
  {
    index: 7,
    label: "Kết quả nhiệm vụ",
    key: "result",
    singleLine: true
  },
  {
    index: 8,
    label: "Ngày thi hành",
    key: "create_datetime",
    labelType: "time",
    singleLine: true
  }
];

export default {
  name: "CeleryLog",
  components: { DetailFormDialog },
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      showSearch: true,
      total: 0,
      openDetailModal: false,
      list: [],
      statusOptions: [{ dictLabel: "Thành công", dictValue: true }, { dictLabel: "Thất bại", dictValue: false }],
      dateRange: [],
      form: {},
      formItem: CELERY_LOG_FORM_ITEM,

      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        func_name: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
    // this.getDicts("sys_common_status").then(response => {
    //   this.statusOptions = response.data;
    // });
  },
  methods: {

    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      }
      );
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      console.log(this.queryParams);
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.multiple = !selection.length;
    },

    handleView(row) {
      this.openDetailModal = true;
      this.form = row;
    },

    handleDelete(row) {
      const infoIds = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số truy cập như"' + infoIds + '"?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delCeleryLog(infoIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    },
    handleClean() {
      this.$confirm("Bạn có chắc chắn xóa tất cả các mục dữ liệu nhật ký đăng nhập không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return cleanCeleryLog();
      }).then(() => {
        this.getList();
        this.msgSuccess("Clean thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu nhật ký thời gian không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportCeleryLog(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>

