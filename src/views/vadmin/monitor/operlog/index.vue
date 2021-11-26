<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Mô-đun hệ thống" prop="request_modular" label-width="180px">
        <el-input
          v-model="queryParams.request_modular"
          placeholder="Vui lòng nhập mô-đun hệ thống"
          clearable
          style="width: 240px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Người tạo" prop="creator_name" label-width="90px">
        <el-input
          v-model="queryParams.creator_name"
          placeholder="Vui lòng nhập"
          clearable
          style="width: 170px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status" label-width="90px">
        <el-select
          v-model="queryParams.status"
          placeholder="Trạng thái"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Thời gian hoạt động" label-width="220px">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="Thời gian bắt đầu"
          end-placeholder="Thời gian kết thúc"
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
          v-hasPermi="['admin:system:operation_log:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Xóa
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['admin:system:operation_log:clean:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
        >Clean
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['admin:system:operlog:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="STT" align="center" prop="id" />
      <el-table-column label="Mô-đun hệ thống" align="center" prop="request_modular" />
      <el-table-column label="Yêu cầu phương thức" align="center" prop="request_method" />
      <el-table-column label="Người tạo" align="center" prop="creator_name" />
      <el-table-column label="IP" align="center" prop="request_ip" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="Location" align="center" prop="request_location" :show-overflow-tooltip="true" />
      <el-table-column label="Trạng thái" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="Thời gian truy vấn" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['admin:system:operlog:get']"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row,scope.index)"
          >Xem
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
      dialog-title="Chi tiết nhật ký hoạt động"
      modal-width="700px"
      :open-detail-modal="openDetailModal"
      :form-data="form"
      :form-item="formItem"
      @closeDialog="value=>{openDetailModal=value}"
    >
      <template slot="customRequestModular">
        <span>{{ connectFieldsContent([form.request_modular, form.request_msg], '/') }}</span>
      </template>
      <template slot="customLoginInfo">
        <span>{{ connectFieldsContent([form.creator_name, form.request_ip, form.request_location, form.request_browser], '/') }}</span>
      </template>
    </detail-form-dialog>
  </div>
</template>

<script>
import { cleanOperationLog, delOperationLog, exportOperationLog, list } from "@/api/vadmin/system/operationlog";
import DetailFormDialog from "@/components/Modal/DetailFormDialog";

const OPERATION_LOG_FORM_ITEM = [
  {
    index: 1,
    label: "Module hoạt động",
    key: "customRequestModular",
    customRender: true,
    singleLine: true
  },
  {
    index: 2,
    label: "Thông tin đăng nhập",
    key: "customLoginInfo",
    customRender: true,
    singleLine: true
  },
  {
    index: 3,
    label: "Yêu cầu địa chỉ",
    key: "request_path"
  },
  {
    index: 4,
    label: "Yêu cầu than số",
    key: "request_body",
    singleLine: true
  },
  {
    index: 5,
    label: "Kết quả",
    key: "json_result"
  },
  {
    index: 6,
    label: "Mã lỗi",
    key: "response_code"
  },
  {
    index: 7,
    label: "Tình trạng hoạt động",
    key: "status",
    labelType: "boolean",
    labelChoices: {
      false: "Thất bại",
      true: "Thông thường"
    }
  },
  {
    index: 8,
    label: "Kết quả",
    key: "result",
    singleLine: true
  },
  {
    index: 9,
    label: "Thời gian truy vấn",
    key: "create_datetime",
    labelType: "time",
    singleLine: true
  }
];

export default {
  name: "Operlog",
  components: { DetailFormDialog },
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      showSearch: true,
      total: 0,
      list: [],
      openDetailModal: false,
      statusOptions: [{ dictLabel: "Thành công", dictValue: true }, { dictLabel: "Thất bại", dictValue: false }],
      dateRange: [],
      form: {},
      formItem: OPERATION_LOG_FORM_ITEM,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        request_modular: undefined,
        creator_name: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
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
      const ids = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số nhật ký như"' + ids + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delOperationLog(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa thành công");
      });
    },
    handleClean() {
      this.$confirm("Bạn có chắc chắn xóa tất cả các mục dữ liệu nhật ký hoạt động không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return cleanOperationLog();
      }).then(() => {
        this.getList();
        this.msgSuccess("Dọn dẹp thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu nhật ký hoạt động không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportOperationLog(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    },
    connectFieldsContent(fieldsContent, symbol) {
      fieldsContent.forEach((fieldContent, index) => {
        if (!fieldContent) {
          delete fieldsContent[index];
        }
      });
      return fieldsContent.join(symbol);
    }
  }
};
</script>

