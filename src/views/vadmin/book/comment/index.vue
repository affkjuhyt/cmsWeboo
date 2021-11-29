<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="70px">
      <el-form-item label="Tên truyện" prop="book" label-width="90px">
        <el-select
          v-model="queryParams.book"
          placeholder="Tên truyện"
          clearable
          size="small"
          style="width: 240px"
          @change="handleChange($event)"
        >
          <el-option
            v-for="item in listBookOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Tên chương" prop="chapter" label-width="110px">
        <el-select
          v-model="queryParams.chapter"
          placeholder="Tên chương"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in chapterBookOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Làm mới</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:comment:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:comment:{id}:put']"
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
          v-hasPermi="['system:comment:{id}:delete']"
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
          v-hasPermi="['system:comment:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất dữ liệu</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:comment:clearcache:delete']"
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
      <!-- <el-table-column label="Tên" align="center" prop="title" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link :to="hasPermi(['system:book:chapter:get']) ?'/book/chapter/data/' + scope.row.id :'#'" class="link-type">
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template>
      </el-table-column> -->
      <el-table-column label="Book" align="center" prop="book" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="Trạng thái" align="center" prop="status" />
      <el-table-column label="Chapter" align="center" prop="chapter" />
      <el-table-column label="User" align="center" prop="user" />
      <el-table-column label="Content" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="Số lượt like" prop="like_count" :show-overflow-tooltip="true" />
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:comment:{id}:put','system:comment:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:comment:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['system:comment:{id}:delete']"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Tên" prop="title">
          <el-input v-model="form.title" placeholder="Nhập tên truyện" />
        </el-form-item>
        <el-form-item label="Author" prop="author">
          <el-input v-model="form.author" placeholder="Nhập tên tác giả"></el-input>
        </el-form-item>
        <el-form-item label="Nội dung" prop="content">
          <el-input v-model="form.type" placeholder="Nhập thể loại truyện" />
        </el-form-item>
        <el-form-item label="Miêu tả" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="Nhập miêu tả truyện" />
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
import { listComment, addComment, updateComment, delComment, exportComment, clearCache } from "@/api/vadmin/system/comment/data";
import { listBook } from "@/api/vadmin/system/book/data";
import { getChapters } from "@/api/vadmin/system/book/chapter";

export default {
  name: "Comment",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      typeList: [],
      title_name: "",
      open: false,
      listBookOptions: [],
      chapterBookOptions: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        content: undefined,
        status: undefined,
        like_count: undefined,
        book: undefined,
        chapter: undefined,
        user: undefined
        // view_count: undefined,
        // star: undefined,
        // is_enable: undefined,
        // is_vip: undefined,
        // is_full: undefined,
        // is_suggest: undefined
      },
      form: {},
      rules: {
        title: [
          { required: true, message: "Tên truyện không thể viết thiếu", trigger: "blur" }
        ],
        type: [
          { required: true, message: "Thể loại không thể thiếu", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getBookList();
    // this.getDicts("sys_normal_disable").then(response => {
    //   this.statusOptions = response.data;
    // });
  },
  methods: {
    getList() {
      this.loading = true;
      console.log("AAAA: " + JSON.stringify(this.queryParams));
      listComment(this.queryParams).then(response => {
        this.typeList = response.data.results;
        console.log(response);
        this.total = response.data.count;
        this.loading = false;
      }
      );
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
        title: undefined,
        content: undefined,
        status: undefined,
        like_count: undefined,
        book: undefined,
        chapter: undefined,
        user: undefined
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
    /** Add comment */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title_name = "Thêm mới comment";
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
      updateComment(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title_name = "Chỉnh sửa comment";
      });
    },
    getBookList() {
      listBook({ pageNum: "all" }).then((response) => {
        this.listBookOptions = response.data;
      });
    },
    handleChange(event) {
      getChapters(this.queryParams).then((response) => {
        this.chapterBookOptions = response.results;
        console.log("chapterBookOptions: " + JSON.stringify(this.chapterBookOptions));
      });
    },
    /** Submit form */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateComment(this.form).then(response => {
              this.msgSuccess("Chỉnh sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addComment(this.form).then(response => {
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
      this.$confirm('Bạn có muốn xóa truyện không"' + ids + '"Mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delComment(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa truyện thành công");
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
        return exportComment(queryParams);
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
