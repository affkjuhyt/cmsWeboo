<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tên bảng" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="Vui lòng nhập tên bảng"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Bảng mô tả" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="Vui lòng nhập mô tả bảng"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Thời gian tạo">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="ngày bắt đầu"
          end-placeholder="Ngày cuốis"
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
          v-hasPermi="['tool:gen:code']"
          type="primary"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleGenTable"
        >Gen table</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['tool:gen:import']"
          type="info"
          plain
          icon="el-icon-upload"
          size="mini"
          @click="openImportTable"
        >Import bảng</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['tool:gen:edit']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleEditTable"
        >Edit table</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['tool:gen:remove']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Delete</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column label="Số seri" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Tên bảng"
        align="center"
        prop="tableName"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="Bảng mô tả"
        align="center"
        prop="tableComment"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="thực thể"
        align="center"
        prop="className"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="160" />
      <el-table-column label="Thời gian cập nhật" align="center" prop="create_datetime" width="160" />
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['tool:gen:preview']"
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handlePreview(scope.row)"
          >Xem trước</el-button>
          <el-button
            v-hasPermi="['tool:gen:edit']"
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEditTable(scope.row)"
          >chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['tool:gen:remove']"
            type="text"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >xóa bỏ</el-button>
          <el-button
            v-hasPermi="['tool:gen:edit']"
            type="text"
            size="small"
            icon="el-icon-refresh"
            @click="handleSynchDb(scope.row)"
          >Làm cho đồng bộ</el-button>
          <el-button
            v-hasPermi="['tool:gen:code']"
            type="text"
            size="small"
            icon="el-icon-download"
            @click="handleGenTable(scope.row)"
          >Tạo mã</el-button>
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
    <el-dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" append-to-body>
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :key="key"
          :label="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
        >
          <pre><code class="hljs" v-html="highlightedCode(value, key)" /></pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="import" @ok="handleQuery" />
  </div>
</template>

<script>
import { listTable, previewTable, delTable, genCode, synchDb } from "@/api/vadmin/tool/gen";
import importTable from "./importTable";
import { downLoadZip } from "@/utils/zipdownload";
import hljs from "highlight.js/lib/highlight";
import "highlight.js/styles/github-gist.css";
hljs.registerLanguage("java", require("highlight.js/lib/languages/java"));
hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("html", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("vue", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"));
hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"));

export default {
  name: "Gen",
  components: { importTable },
  data() {
    return {
      loading: true,
      uniqueId: "",
      ids: [],
      tableNames: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      tableList: [],
      dateRange: "",
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      },
      preview: {
        open: false,
        title: "Xem trước mã",
        data: {},
        activeName: "domain.java"
      }
    };
  },
  created() {
    this.getList();
  },
  activated() {
    const time = this.$route.query.t;
    if (time != null && time != this.uniqueId) {
      this.uniqueId = time;
      this.resetQuery();
    }
  },
  methods: {
    getList() {
      this.loading = true;
      listTable(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.tableList = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handleGenTable(row) {
      const tableNames = row.tableName || this.tableNames;
      if (tableNames == "") {
        this.msgError("Vui lòng chọn dữ liệu sẽ được tạo");
        return;
      }
      if (row.genType === "1") {
        genCode(row.tableName).then(response => {
          this.msgSuccess("Đã tạo thành công cho một đường dẫn tùy chỉnh:" + row.genPath);
        });
      } else {
        downLoadZip("/tool/gen/batchGenCode?tables=" + tableNames, "ruoyi");
      }
    },
    handleSynchDb(row) {
      const tableName = row.tableName;
      this.$confirm('Xác nhận rằng bạn muốn buộc đồng bộ hóa"' + tableName + '"mục dữ liệu？', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return synchDb(tableName);
      }).then(() => {
        this.msgSuccess("Đồng bộ thành công");
      });
    },
    openImportTable() {
      this.$refs.import.show();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handlePreview(row) {
      previewTable(row.tableId).then(response => {
        this.preview.data = response.data;
        this.preview.open = true;
      });
    },
    highlightedCode(code, key) {
      const vmName = key.substring(key.lastIndexOf("/") + 1, key.indexOf(".vm"));
      var language = vmName.substring(vmName.indexOf(".") + 1, vmName.length);
      const result = hljs.highlight(language, code || "", true);
      return result.value || "&nbsp;";
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.tableId);
      this.tableNames = selection.map(item => item.tableName);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleEditTable(row) {
      const tableId = row.tableId || this.ids[0];
      this.$router.push("/gen/edit/" + tableId);
    },
    handleDelete(row) {
      const tableIds = row.tableId || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số bảng như"' + tableIds + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delTable(tableIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa thành công");
      });
    }
  }
};
</script>
