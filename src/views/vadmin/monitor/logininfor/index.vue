<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Địa chỉ đăng nhập" prop="ipaddr" label-width="150px">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="Vui lòng nhập địa chỉ đăng nhập"
          clearable
          style="width: 240px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="Vui lòng nhập tên người dùng"
          clearable
          style="width: 240px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Trạng thái"
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
      <el-form-item label="Thời gian đăng nhập" label-width="180px">
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
          v-hasPermi="['admin:system:logininfor:{id}:delete']"
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
          v-hasPermi="['admin:system:logininfor:clean:delete']"
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
          v-hasPermi="['admin:system:logininfor:export:get']"
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
      <el-table-column label="Tên tài khoản" align="center" prop="creator_name" />
      <el-table-column label="IP" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="Location" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="Trình duyệt" align="center" prop="browser" />
      <el-table-column label="Hệ điều hành" align="center" prop="os" />
      <el-table-column label="Trạng thái" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="Tin nhắn" align="center" prop="msg" />
      <el-table-column label="Thời gian đăng nhập" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['admin:system:logininfor:get']"
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
      dialog-title="Chi tiết nhật kí đăng nhập"
      modal-width="700px"
      :open-detail-modal="openDetailModal"
      :form-data="form"
      :form-item="formItem"
      @closeDialog="value=>{openDetailModal=value}"
    />

  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor, exportLogininfor } from "@/api/vadmin/monitor/logininfor";
import DetailFormDialog from "@/components/Modal/DetailFormDialog";

const LOGIN_FORM_ITEM = [
  {
    index: 1,
    label: "Id",
    key: "id"
  },
  {
    index: 2,
    label: "Người tạo",
    key: "creator_name"
  },
  {
    index: 3,
    label: "Địa chỉ IP",
    key: "ipaddr"
  },
  {
    index: 4,
    label: "Vị trí đăng nhập",
    key: "loginLocation"
  },
  {
    index: 5,
    label: "Trình duyệt",
    key: "browser"
  },
  {
    index: 6,
    label: "Hệ điều hành",
    key: "browser"
  },
  {
    index: 7,
    label: "Thông tin hoạt động",
    key: "os"
  },
  {
    index: 8,
    label: "Trạng thái đăng nhập",
    key: "status",
    labelType: "boolean",
    labelChoices: {
      false: "Thất bại",
      true: "Thông thường"
    }
  },
  {
    index: 9,
    label: "Thời gian đăng nhập",
    key: "create_datetime",
    labelType: "time",
    singleLine: true
  }

];

export default {
  name: "Logininfor",
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
      statusOptions: [{ dictLabel: "Sự thành công", dictValue: true }, { dictLabel: "Thất bại", dictValue: false }],
      dateRange: [],
      form: {},
      formItem: LOGIN_FORM_ITEM,

      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ipaddr: undefined,
        userName: undefined,
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
      this.$confirm('Bạn chắc chắn xóa thông tin"' + infoIds + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delLogininfor(infoIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa thành công");
      });
    },
    handleClean() {
      this.$confirm("Bạn có chắc chắn xóa tất cả các mục dữ liệu nhật ký đăng nhập không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return cleanLogininfor();
      }).then(() => {
        this.getList();
        this.msgSuccess("Làm trống thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu nhật ký hoạt động không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportLogininfor(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>

