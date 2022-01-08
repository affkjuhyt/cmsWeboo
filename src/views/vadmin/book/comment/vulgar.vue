<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="Cụm từ" prop="word">
        <el-input
          v-model="queryParams.word"
          placeholder="Vui lòng nhập cụm từ"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Từ thay thế" prop="re_word">
        <el-input
          v-model="queryParams.re_word"
          placeholder="Vui lòng nhập từ thay thế"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Làm mới</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:vulgar:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:vulgar:{id}:put']"
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
          v-hasPermi="['system:vulgar:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Delete</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:vulgar:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất dữ liệu</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="100" />
      <el-table-column label="Cụm từ" align="center" prop="word" :show-overflow-tooltip="true" />
      <el-table-column label="Từ thay thế" align="center" prop="re_word" :show-overflow-tooltip="true" />
      <el-table-column
        v-if="hasPermi(['system:vulgar:{id}:put','system:vulgar:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:vulgar:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['system:vulgar:{id}:delete']"
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

    <!-- Thêm mới -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="Cụm từ" prop="word" label-width="100px">
          <el-input v-model="form.word" placeholder="Nhập cụm từ" />
        </el-form-item>
        <el-form-item label="Từ thay thế" prop="re_word" label-width="100px">
          <el-input v-model="form.re_word" placeholder="Nhập từ thay thế" />
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
import { listVulgar, getVulgar, delVulgar, addVulgar, updateVulgar, exportVulgar } from "@/api/vadmin/system/comment/vulgar";

export default {
  name: "Vulgar",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      typeList: [],
      title: "",
      open: false,
      statusOptions: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        word: undefined,
        re_word: undefined
      },
      form: {},
      rules: {
        word: [
          { required: true, message: "Tên từ không thể viết thiếu", trigger: "blur" }
        ],
        re_word: [
          { required: true, message: "Từ thay thế không thể thiếu", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      console.log("AAAA: " + JSON.stringify(this.addDateRange(this.queryParams, this.dateRange)));
      listVulgar(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.typeList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      }
      );
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
        word: undefined,
        re_word: undefined
      };
      this.resetForm("form");
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
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm từ mới";
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getVulgar(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Chỉnh sửa cụm từ";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateVulgar(this.form).then(response => {
              this.msgSuccess("Chỉnh sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addVulgar(this.form).then(response => {
              this.msgSuccess("Thêm mới thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('Bạn có muốn xóa từ không"' + ids + '"?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delVulgar(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa cụm từ thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc muốn export tất cả các loại dữ liệu?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportVulgar(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>
