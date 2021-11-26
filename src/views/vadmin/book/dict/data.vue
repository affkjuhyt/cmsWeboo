<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="Tên từ điển" prop="dictType">
        <el-select v-model="queryParams.dictType" size="small">
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Thẻ từ điển" prop="dictLabel">
        <el-input
          v-model="queryParams.dictLabel"
          placeholder="Vui lòng nhập thẻ từ điển"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Trạng thái dữ liệu"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Tìm kiếm</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:type:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:type:{id}:put']"
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
          v-hasPermi="['system:dict:type:{id}:delete']"
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
          v-hasPermi="['system:dict:type:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:type:clearcache:delete']"
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
        >Xóa cache</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="dataList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="Label" align="center" prop="dictLabel" />
      <el-table-column label="Value" align="center" prop="dictValue" />
      <el-table-column label="Sort" align="center" prop="sort" />
      <el-table-column label="Is default" align="center" prop="is_default">
        <template slot-scope="scope">
          <el-switch
            disabled
            :value="scope.row.is_default"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="Status"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        label="Remark"
        align="center"
        prop="remark"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:dict:type:{id}:put','system:dict:type:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:dict:type:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['system:dict:type:{id}:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >Xóa</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Loại từ điển">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="Thẻ từ điển" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="Vui lòng nhập thẻ từ điểns" />
        </el-form-item>
        <el-form-item label="Giá trị" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="Vui lòng nhập giá trị" />
        </el-form-item>
        <el-form-item label="Sắp xếp hiển thị" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Mặc định" prop="is_default">
          <el-switch
            v-model="form.is_default"
            active-text="Có"
            inactive-text="Không"
          />
        </el-form-item>
        <el-form-item label="Trang thái" prop="status">
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
import { addData, delData, exportData, getData, listData, updateData } from "@/api/vadmin/system/dict/data";
import { getType, listType, clearCache } from "@/api/vadmin/system/dict/type";

export default {
  name: "Data",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      dataList: [],
      defaultDictType: "",
      title: "",
      open: false,
      statusOptions: [],
      typeOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      form: {},
      rules: {
        name: [{ required: true, message: "Nhãn từ điển không được thiếu", trigger: "blur" }],
        dictValue: [{ required: true, message: "Giá trị từ điển không được thiếu", trigger: "blur" }],
        sort: [{ required: true, message: "Thứ tự không được thiếu", trigger: "blur" }]
      }
    };
  },
  created() {
    const dictId = this.$route.params && this.$route.params.dictId;
    this.getType(dictId);
    this.getTypeList();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    getType(dictId) {
      getType(dictId).then((response) => {
        this.queryParams.dictType = response.data.dictType;
        this.defaultDictType = response.data.dictType;
        this.getList();
      });
    },
    getTypeList() {
      listType({ pageNum: "all" }).then((response) => {
        this.typeOptions = response.data;
      });
    },
    getList() {
      this.loading = true;
      console.log("AAAA: " + JSON.stringify(this.queryParams));
      listData(this.queryParams).then((response) => {
        this.dataList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      });
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
        dictLabel: undefined,
        dictValue: undefined,
        sort: 0,
        status: this.selectDictDefault(this.typeOptions),
        remark: undefined
      };
      this.resetForm("form");
    },
    handleQuery() {
      let dictId = "";
      this.typeOptions.map((val) => {
        if (val.dictType === this.queryParams.dictType) {
          dictId = val.id;
        }
      });
      this.$route.params.dictId = dictId;
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm từ điển";
      this.form.dictType = this.queryParams.dictType;
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getData(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa dữ liệu từ điển";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateData(this.form).then((response) => {
              this.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            const dictId = this.$route.params && this.$route.params.dictId;
            this.form.dict_data = dictId;
            addData(this.form).then((response) => {
              this.msgSuccess("Thêm mới thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const dictCodes = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa mã từ điển như"' + dictCodes + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Không",
        type: "warning"
      }).then(function() {
        return delData(dictCodes);
      })
        .then(() => {
          this.getList();
          this.msgSuccess("Xóa thành công");
        });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportData(queryParams);
      })
        .then((response) => {
          this.download(response.data.file_url, response.data.name);
        });
    },
    handleClearCache() {
      clearCache().then((response) => {
        this.msgSuccess("Đã xóa thành công");
      });
    }
  }
};
</script>
