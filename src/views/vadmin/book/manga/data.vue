<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <!-- <el-form-item label="Tên sách" prop="dictType">
        <el-select v-model="queryParams.dictType" size="small">
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictType"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="Tên chương" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="Nhập tên chương"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Tạo mới</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:book:chapter:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm chương</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:book:chapter:{id}:put']"
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
          v-hasPermi="['system:book:chapter:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Xóa chương</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:book:chapter:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất dữ liệu</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:book:chapter:clearcache:delete']"
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
      <el-table-column label="Tên chương" align="center" prop="title" />
      <el-table-column label="Tên truyện" align="center" prop="name_book" />
      <el-table-column label="Số chương" align="center" prop="number" />
      <el-table-column label="Số like" align="center" prop="like_count">
        <!-- <template slot-scope="scope">
          <el-switch
            disabled
            :value="scope.row.is_default"
          />
        </template> -->
      </el-table-column>
      <!-- <el-table-column
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        :show-overflow-tooltip="true"
      /> -->
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:book:chapter:{id}:put','system:book:chapter:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:book:chapter:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['system:book:chapter:{id}:delete']"
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

    <el-dialog :title_name="title_name" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="是否默认" prop="is_default">
          <el-switch
            v-model="form.is_default"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listChapter, getChapter, getChapters, addChapter, updateChapter, delChapter, exportChapter } from "@/api/vadmin/system/book/chapter";
// import { getType, listType, clearCache } from "@/api/vadmin/system/dict/type";
import { clearCache } from "@/api/vadmin/system/book/data";

export default {
  name: "Chapter",
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
      title_name: "",
      open: false,
      statusOptions: [],
      typeOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        description: undefined,
        number: undefined,
        title: undefined,
        thumbnail: undefined,
        like_count: undefined,
        book: undefined,
        name_book: undefined
      },
      form: {},
      rules: {
        name: [{ required: true, message: "数据标签不能为空", trigger: "blur" }],
        dictValue: [{ required: true, message: "数据键值不能为空", trigger: "blur" }],
        sort: [{ required: true, message: "数据顺序不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    const bookId = this.$route.params && this.$route.params.bookId;
    console.log("CCCC: " + JSON.stringify(this.$route.params));
    // this.getTypeList();
    this.getChapter(bookId);
    // this.getDicts("sys_normal_disable").then((response) => {
    //   this.statusOptions = response.data;
    // });
  },
  methods: {
    getChapter(bookId) {
      this.queryParams.book = bookId;
      this.getList();
    },
    getTypeList() {
      listChapter({ pageNum: "all" }).then((response) => {
        this.typeOptions = response.data;
      });
    },
    getList() {
      this.loading = true;
      console.log("AAAA: " + JSON.stringify(this.queryParams));
      getChapters(this.queryParams).then((response) => {
        this.dataList = response.results;
        this.total = response.count;
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
        description: undefined,
        number: undefined,
        title: undefined,
        thumbnail: undefined,
        like_count: undefined,
        book: undefined,
        name_book: undefined
        // sort: 0,
        // status: this.selectDictDefault(this.typeOptions),
        // remark: undefined
      };
      this.resetForm("form");
    },
    handleQuery() {
      let bookId = "";
      this.typeOptions.map((val) => {
        if (val.book === this.queryParams.book) {
          bookId = val.id;
        }
      });
      this.$route.params.bookId = bookId;
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.book = this.defaultDictType;
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title_name = "Thêm chương mới";
      this.form.book = this.queryParams.book;
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getChapter(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title_name = "Sửa đổi dữ liệu";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateChapter(this.form).then((response) => {
              this.msgSuccess("Chỉnh sửa dữ liệu thành công");
              this.open = false;
              this.getList();
            });
          } else {
            const bookId = this.$route.params && this.$route.params.bookId;
            this.form.dict_data = bookId;
            addChapter(this.form).then((response) => {
              this.msgSuccess("Thêm chương thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa chương"' + ids + '"?', "Cảnh báo", {
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delChapter(ids);
      })
        .then(() => {
          this.getList();
          this.msgSuccess("Xóa thành công");
        });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả dữ liệu?", "Cảnh báo", {
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportChapter(queryParams);
      })
        .then((response) => {
          this.download(response.data.file_url, response.data.name);
        });
    },
    handleClearCache() {
      clearCache().then((response) => {
        this.msgSuccess("Xóa cache thành công");
      });
    }
  }
};
</script>
