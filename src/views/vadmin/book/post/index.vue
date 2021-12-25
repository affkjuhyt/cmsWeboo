<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="70px">
      <el-form-item label="Tên" prop="user">
        <el-input
          v-model="queryParams.user"
          placeholder="Vui lòng nhập tên người post"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="Trạng thái" prop="status" label-width="100px">
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
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Làm mới</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:post:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:post:{id}:put']"
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
          v-hasPermi="['system:post:{id}:delete']"
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
          v-hasPermi="['system:post:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất dữ liệu</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:post:clearcache:delete']"
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
        >Xóa cache</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="100" />
      <el-table-column label="Group" align="center" prop="group" :show-overflow-tooltip="true">
        <!-- <template slot-scope="scope">
          <router-link :to="hasPermi(['system:group:chapter:get']) ?'/book/chapter/data/' + scope.row.id :'#'" class="link-type">
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template> -->
      </el-table-column>
      <el-table-column label="User" align="center" prop="user" />
      <el-table-column label="Nội dung" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="Số lượt like" align="center" prop="like_count" :show-overflow-tooltip="true" />
      <el-table-column label="Số lượt chia sẻ" align="center" prop="share_count" :show-overflow-tooltip="true" />
      <el-table-column label="Thời gian tạo" align="center" prop="date_added" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.date_added }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:post:{id}:put','system:post:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:post:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['system:post:{id}:delete']"
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
    <el-dialog :title="title_name" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Group" prop="group">
          <el-select v-model="form.groupIds" multiple placeholder="Group">
            <el-option
              v-for="item in groupOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="item.status == 0"
            />
          </el-select>
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
        <el-form-item label="Nội dung bài viết" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="Nhập nội dung bài viết" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
        <el-button @click="cancel">Hủy</el-button>
      </div>
    </el-dialog>
    <el-divider />

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listPostGroup, getPostGroup, addPostGroup, updatePostGroup, delPostGroup, exportPostGroup, clearCache } from "@/api/vadmin/system/post/data";
import { listGroup } from "@/api/vadmin/system/group/data";
import PieChart from "./PostPieChart";
import BarChart from "./PostBarChart";

export default {
  name: "Group",
  components: { PieChart, BarChart },
  data() {
    return {
      // Loading
      loading: true,
      // Array
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      typeList: [],
      title_name: "",
      open: false,
      statusOptions: [],
      groupOptions: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        content: undefined,
        like_count: undefined,
        share_count: undefined,
        user: undefined,
        group: undefined
      },
      form: {},
      rules: {
        name: [
          { required: true, message: "Tên nhóm không thể viết thiếu", trigger: "blur" }
        ],
        status: [
          { required: true, message: "Trạng thái không thể thiếu", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getGroupList();
  },
  methods: {
    getList() {
      this.loading = true;
      console.log("AAAA: " + JSON.stringify(this.queryParams));
      listPostGroup(this.queryParams).then(response => {
        this.typeList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      }
      );
    },
    getGroupList() {
      listGroup({ pageNum: "all" }).then((response) => {
        this.groupOptions = response.data;
      });
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // Cancel
    cancel() {
      this.open = false;
      this.reset();
    },
    // Reset
    reset() {
      this.form = {
        id: undefined,
        content: undefined,
        like_count: undefined,
        share_count: undefined,
        user: undefined,
        group: undefined
      };
      this.resetForm("form");
    },
    /** Nút tìm kiếm hoạt động */
    handleQuery() {
      // this.queryParams.title = this.title
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Reset query */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** Add hội nhóm */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title_name = "Thêm mới bài viết mới";
    },
    // Chọn dữ liệu
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** Update data */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getPostGroup(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title_name = "Chỉnh sửa hội nhóm";
      });
    },
    /** Submit form */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updatePostGroup(this.form).then(response => {
              this.msgSuccess("Chỉnh sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addPostGroup(this.form).then(response => {
              this.msgSuccess("Thêm mới thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** Xóa data */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('Bạn có muốn xóa hội nhóm không"' + ids + '"Mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delPostGroup(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa hội nhóm thành công");
      });
    },
    /** Xuất dữ liệu */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc muốn export tất cả các loại dữ liệu?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportPostGroup(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    },
    /** Thao tác xóa bộ nhớ cache */
    handleClearCache() {
      clearCache().then(response => {
        this.msgSuccess("Xóa cache thành công");
      });
    }
  }
};
</script>
