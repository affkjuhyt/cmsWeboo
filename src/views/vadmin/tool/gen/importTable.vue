<template>
  <el-dialog title="Nhập bảng" :visible.sync="visible" width="800px" top="5vh" append-to-body>
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="Tên bảng" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="Vui lòng nhập tên bảngs"
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Query</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table ref="table" :data="dbTableList" height="260px" @row-click="clickRow" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="tableName" label="Tên bảng" :show-overflow-tooltip="true" />
        <el-table-column prop="tableComment" label="Bảng mô tả" :show-overflow-tooltip="true" />
        <el-table-column prop="create_datetime" label="Thời gian tạo" />
        <el-table-column prop="create_datetime" label="Thời gian cập nhật" />
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listDbTable, importTable } from "@/api/vadmin/tool/gen";
export default {
  data() {
    return {
      visible: false,
      tables: [],
      total: 0,
      dbTableList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      }
    };
  },
  methods: {
    show() {
      this.getList();
      this.visible = true;
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    handleSelectionChange(selection) {
      this.tables = selection.map(item => item.tableName);
    },
    getList() {
      listDbTable(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dbTableList = res.rows;
          this.total = res.total;
        }
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleImportTable() {
      importTable({ tables: this.tables.join(",") }).then(res => {
        this.msgSuccess(res.msg);
        if (res.code === 200) {
          this.visible = false;
          this.$emit("ok");
        }
      });
    }
  }
};
</script>
