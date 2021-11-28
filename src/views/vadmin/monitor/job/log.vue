<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tên nhiệm vụ" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="Vui lòng nhập tên nhiệm vụs"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên nhóm công việc" prop="jobGroup">
        <el-select
          v-model="queryParams.jobGroup"
          placeholder="Vui lòng đặt tên cho nhóm nhiệm vụ"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in jobGroupOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Trạng thái thực thi" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Vui lòng chọn trạng thái thực thi"
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
      <el-form-item label="thời gian thực hiện">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="ngày bắt đầu"
          end-placeholder="Ngày cuối"
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
          v-hasPermi="['monitor:job:remove']"
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
          v-hasPermi="['monitor:job:remove']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
        >Clean</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['monitor:job:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" width="80" align="center" prop="jobLogId" />
      <el-table-column label="Tên job" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="Tên nhóm job" align="center" prop="jobGroup" :formatter="jobGroupFormat" :show-overflow-tooltip="true" />
      <el-table-column label="Chuỗi mục tiêu cuộc gọi" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="Thông tin nhật ký" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column label="Trạng thái thực thi" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="Thời gian thực hiện" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['monitor:job:query']"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >Chi tiết</el-button>
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

    <el-dialog title="Lên lịch chi tiết nhật ký" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Số sê-ri nhật ký:">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="Tên nhiệm vụ:">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phân nhóm nhiệm vụ:">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="Thời gian thực hiện:">{{ form.create_datetime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Phương thức gọi:">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Thông tin nhật ký:">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Trạng thái thực thi:">
              <div v-if="form.status == 0">Thông thường</div>
              <div v-else-if="form.status == 1">Thất bại</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status == 1" label="Thông tin ngoại lệ:">{{ form.exceptionInfo }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">Đóng</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listJobLog, delJobLog, exportJobLog, cleanJobLog } from "@/api/vadmin/monitor/jobLog";

export default {
  name: "JobLog",
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      showSearch: true,
      total: 0,
      jobLogList: [],
      open: false,
      dateRange: [],
      form: {},
      statusOptions: [],
      jobGroupOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_job_status").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_job_group").then(response => {
      this.jobGroupOptions = response.data;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listJobLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.jobLogList = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    jobGroupFormat(row, column) {
      return this.selectDictLabel(this.jobGroupOptions, row.jobGroup);
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.jobLogId);
      this.multiple = !selection.length;
    },
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    handleDelete(row) {
      const jobLogIds = this.ids;
      this.$confirm('Bạn có chắc chắn xóa số nhật ký lịch biểu như"' + jobLogIds + '"?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delJobLog(jobLogIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    },
    handleClean() {
      this.$confirm("Bạn có chắc chắn xóa tất cả các mục dữ liệu nhật ký lập lịch không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return cleanJobLog();
      }).then(() => {
        this.getList();
        this.msgSuccess("Clean thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu nhật ký lịch biểu không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportJobLog(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>
