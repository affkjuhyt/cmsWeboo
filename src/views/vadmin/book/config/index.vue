<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tên tham số" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="Vui lòng nhập tên thông số"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên khóa tham số" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="Khóa tham số"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Hệ thống tích hợp" prop="configType">
        <el-select v-model="queryParams.configType" placeholder="Hệ thống tích hợp" clearable size="small">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Resets</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:{id}:put']"
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
          v-hasPermi="['system:config:{id}:delete']"
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
          v-hasPermi="['system:config:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:clearcache:get']"
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
        >Xóa cache</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Id" align="center" prop="id" />
      <el-table-column label="Tên" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="Key" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="Giá trị" align="center" prop="configValue" />
      <el-table-column label="Kiểu config" align="center" prop="configType" :formatter="typeFormat" />
      <el-table-column label="Trạng thái" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="Đánh giá" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:config:{id}:put','system:config:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:config:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['system:config:{id}:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >Xóa</el-button>
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

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Name" prop="configName">
          <el-input v-model="form.configName" placeholder="Vui lòng điền tên" />
        </el-form-item>
        <el-form-item label="Key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="Vui lòng nhập key" />
        </el-form-item>
        <el-form-item label="Giá trị" prop="configValue">
          <el-input v-model="form.configValue" placeholder="Vui lòng nhập giá trị" />
        </el-form-item>
        <el-form-item label="Kiểu type" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio
              v-for="dict in typeOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Trạng thái" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Đánh giá" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Vui lòng nhập nội dung" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
        <el-button @click="cancel">Hủy</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig, getConfig, delConfig, addConfig, updateConfig, exportConfig, clearCache } from "@/api/vadmin/system/config";

export default {
  name: "Config",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      configList: [],
      title: "",
      open: false,
      typeOptions: [],
      statusOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        configKey: undefined,
        configType: undefined,
        status: undefined
      },
      form: {},
      rules: {
        configName: [
          { required: true, message: "Tên tham số không được để trống", trigger: "blur" }
        ],
        configKey: [
          { required: true, message: "Tên khóa tham số không được để trống", trigger: "blur" }
        ],
        configValue: [
          { required: true, message: "Giá trị khóa tham số không được để trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_yes_no").then(response => {
      this.typeOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listConfig(this.addDateRange(this.queryParams)).then(response => {
        this.configList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      }
      );
    },
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.configType);
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
        id: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        configType: this.selectDictDefault(this.typeOptions),
        status: this.selectDictDefault(this.statusOptions),
        remark: undefined
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
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm tham số";
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa thành công";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateConfig(this.form).then(response => {
              this.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(this.form).then(response => {
              this.msgSuccess("Thêm thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const configIds = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số tham số nhưs"' + configIds + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delConfig(configIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu tham số không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportConfig(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    },
    handleClearCache() {
      clearCache().then(response => {
        this.msgSuccess("Xóa cache thành công");
      });
    }
  }
};
</script>
