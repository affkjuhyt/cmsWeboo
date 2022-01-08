<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="Tên truyện" prop="book_name" label-width="120px">
        <el-input
          v-model="queryParams.book_name"
          placeholder="Nhập tên truyện"
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

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold">Truyện tương tự theo nội dung</span>
      </div>
      <el-table
        v-loading="loading"
        :data="dataList"
        :header-cell-style="{ background: '#a8b03e' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column label="ID" align="center" prop="book_id" />
        <el-table-column label="Tên truyện" align="center" prop="book_name" />
        <el-table-column label="Tác giả" align="center" prop="author" />
        <el-table-column label="Số like" align="center" prop="like_count">
        </el-table-column>
        <el-table-column label="Số lượt xem" align="center" prop="view_count" width="180">
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
    <el-divider />
    <el-row>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold">Truyện tương tự theo luật kết hợp</span>
        </div>
        <el-table :data="dataAssociation" border style="width: 100%" :header-cell-style="{ background: '#a8b03e' }">
          <el-table-column label="ID" align="center" prop="target"></el-table-column>
          <el-table-column label="Tên truyện" align="left" prop="title"></el-table-column>
          <el-table-column label="Độ tin cậy" align="center" prop="confidence"></el-table-column>
          <el-table-column label="Tác giả" align="center" prop="author"></el-table-column>
          <el-table-column label="Số lượt thích" align="center" prop="like"></el-table-column>
          <el-table-column label="Số lượt xem" align="center" prop="view_count"></el-table-column>
        </el-table>
      </el-card>
    </el-row>
    <pagination
      v-show="totalAssociation > 0"
      :total="totalAssociation"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listSuggest, listAssociation } from "@/api/vadmin/system/book/recommender";

export default {
  name: "Chapter",
  components: { listSuggest, listAssociation },
  data() {
    return {
      count: 0,
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      totalAssociation: 0,
      dataList: [],
      dataAssociation: [],
      defaultBookId: "",
      title_name: "",
      open: false,
      statusOptions: [],
      listBookOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        description: undefined,
        number: undefined,
        book_name: undefined,
        thumbnail: undefined,
        like_count: undefined,
        book: undefined,
        name_book: undefined
      },
      form: {},
      rules: {
        title: [{ required: true, message: "Vui lòng nhập tên chương", trigger: "blur" }]
      }
    };
  },
  created() {
    console.log("CCCC: " + JSON.stringify(this.$route.params));
    this.getList();
  },
  methods: {
    load() {
      this.count += 2;
    },
    getFiles(event) {
      this.files = event.target.files[0];
      const urls = this.files;
      console.log(urls);
      console.log(this.files);
    },
    getList() {
      this.loading = true;
      const bookId = this.$route.params && this.$route.params.bookId;
      console.log("AAAA: " + bookId);
      listSuggest(bookId).then((response) => {
        this.dataList = response.data.results;
        console.log("Result is: " + JSON.stringify(response.data));
        this.total = response.data.count;
        this.loading = false;
        this.bookIdDefault = bookId;
      });
      // List tương tự theo luật kết hợp
      listAssociation(bookId).then((response) => {
        this.dataAssociation = response.data.results;
        console.log("Result association is: " + JSON.stringify(response.data));
        this.totalAssociation = response.data.count;
        this.loading = false;
        // this.bookIdDefault = bookId;
      });
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    handleQuery() {
      this.$route.params.bookId = this.bookIdDefault;
      console.log("Book: " + this.$route.params.bookId);
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.book = this.defaultBookId;
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    }
  }
};
</script>

<style>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 100%;
  }
</style>
