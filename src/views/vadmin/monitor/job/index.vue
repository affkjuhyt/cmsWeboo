<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tên job" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="Vui lòng nhập tên job"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên nhóm công việc" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="Vui lòng nhập tên nhóm công việc" clearable size="small">
          <el-option
            v-for="dict in jobGroupOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select v-model="queryParams.status" placeholder="Vui lòng chọn trạng thái nhiệm vụ" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['monitor:job:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['monitor:job:edit']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >Chỉnh sửa</el-button>
      </el-col>
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
          v-hasPermi="['monitor:job:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['monitor:job:query']"
          type="info"
          plain
          icon="el-icon-s-operation"
          size="mini"
          @click="handleJobLog"
        >Nhật ký</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Id" align="center" prop="jobId" />
      <el-table-column label="Tên job" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="Tên nhóm job" align="center" prop="jobGroup" :formatter="jobGroupFormat" />
      <el-table-column label="Chuỗi mục tiêu cuộc gọi" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="biểu thức thực thi cron" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column label="Trạng thái" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['monitor:job:changeStatus']"
            size="mini"
            type="text"
            icon="el-icon-caret-right"
            @click="handleRun(scope.row)"
          >Thực hiện một lần</el-button>
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

    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Tên nhiệm vụ" prop="jobName">
              <el-input v-model="form.jobName" placeholder="Vui lòng nhập tên nhiệm vụ" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhóm nhiệm vụ" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="Vui lòng chọn">
                <el-option
                  v-for="dict in jobGroupOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <span slot="label">
                Phương thức gọi
                <el-tooltip placement="top">
                  <div slot="content">
                    Bean ví dụ：ryTask.ryParams('ry')
                    <br>Class Ví dụ về cuộc gọi trong lớp：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                    <br>Mô tả tham số: chuỗi hỗ trợ, boolean, số nguyên dài, dấu phẩy động, số nguyên
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </span>
              <el-input v-model="form.invokeTarget" placeholder="Vui lòng nhập chuỗi mục tiêu đang gọi" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="Vui lòng nhập biểu thức thực thi cron" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Cho dù đồng thời" prop="concurrent">
              <el-radio-group v-model="form.concurrent" size="small">
                <el-radio-button label="0">Cho phép</el-radio-button>
                <el-radio-button label="1">Cấm</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Job sai" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy" size="small">
                <el-radio-button label="1">Thực thi ngay lập tức</el-radio-button>
                <el-radio-button label="2">Thực hiện một lần</el-radio-button>
                <el-radio-button label="3">Từ bỏ</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Trạng thái">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
        <el-button @click="cancel">Hủy</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Chi tiết công việc" :visible.sync="openView" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="120px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Số công việc:">{{ form.jobId }}</el-form-item>
            <el-form-item label="Tên nhiệm vụ: ">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phân nhóm nhiệm vụ:">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="Thời gian sáng tạo:">{{ form.create_datetime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="biểu thức cron:">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Thời gian thực hiện tiếp theo:">{{ parseTime(form.nextValidTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Gọi phương thức đich">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái job">
              <div v-if="form.status == 0">Thông thường</div>
              <div v-else-if="form.status == 1">Thất bại</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Cho dù đồng thời:">
              <div v-if="form.concurrent == 0">cho phép</div>
              <div v-else-if="form.concurrent == 1">cấm</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Chiến lược thực thi: ">
              <div v-if="form.misfirePolicy == 0">Chiến lược mặc định</div>
              <div v-else-if="form.misfirePolicy == 1">Thực thi ngay lập tức</div>
              <div v-else-if="form.misfirePolicy == 2">Thực hiện một lần</div>
              <div v-else-if="form.misfirePolicy == 3">Từ bỏ</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="openView = false">Mở</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listJob, getJob, delJob, addJob, updateJob, exportJob, runJob, changeJobStatus } from "@/api/vadmin/monitor/job";

export default {
  name: "Job",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      jobList: [],
      title: "",
      open: false,
      openView: false,
      jobGroupOptions: [],
      statusOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      },
      form: {},
      rules: {
        jobName: [
          { required: true, message: "Tên nhiệm vụ không được để trống", trigger: "blur" }
        ],
        invokeTarget: [
          { required: true, message: "Chuỗi mục tiêu cuộc gọi không được để trống", trigger: "blur" }
        ],
        cronExpression: [
          { required: true, message: "biểu thức thực thi cron không được để trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_job_group").then(response => {
      this.jobGroupOptions = response.data;
    });
    this.getDicts("sys_job_status").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listJob(this.queryParams).then(response => {
        this.jobList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    jobGroupFormat(row, column) {
      return this.selectDictLabel(this.jobGroupOptions, row.jobGroup);
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        jobId: undefined,
        jobName: undefined,
        jobGroup: undefined,
        invokeTarget: undefined,
        cronExpression: undefined,
        misfirePolicy: 1,
        concurrent: 1,
        status: "0"
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.jobId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleStatusChange(row) {
      const text = row.status === "0" ? "cho phép" : "hủy kích hoạt";
      this.$confirm('Xác nhận để"' + text + '""' + row.jobName + '"nhiệm vụ?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return changeJobStatus(row.jobId, row.status);
      }).then(() => {
        this.msgSuccess(text + "thành công");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    handleRun(row) {
      this.$confirm('Xác nhận rằng bạn muốn thực thi nó ngay lập tức"' + row.jobName + '"nhiệm vụ?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return runJob(row.jobId, row.jobGroup);
      }).then(() => {
        this.msgSuccess("Thực hiện thành công");
      });
    },
    handleView(row) {
      getJob(row.jobId).then(response => {
        this.form = response.data;
        this.openView = true;
      });
    },
    handleJobLog() {
      this.$router.push("/job/log");
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm mới";
    },
    handleUpdate(row) {
      this.reset();
      const jobId = row.jobId || this.ids;
      getJob(jobId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Chỉnh sửa job";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.jobId != undefined) {
            updateJob(this.form).then(response => {
              this.msgSuccess("Chỉnh sửa job thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addJob(this.form).then(response => {
              this.msgSuccess("Thêm job thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const jobIds = row.jobId || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số nhiệm vụ đã lên lịch là"' + jobIds + '"mục dữ liệu?', "CẢnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delJob(jobIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu nhiệm vụ được hẹn giờ không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportJob(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>
