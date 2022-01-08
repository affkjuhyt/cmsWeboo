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
        <span style="font-weight: bold">Truyện được đề xuất theo hành vi</span>
      </div>
      <el-table
        v-loading="loading"
        :data="dataList"
        :header-cell-style="{ background: '#a8b03e' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column label="ID" align="center" prop="book_id" />
        <el-table-column label="Tên truyện" align="left" prop="book_name" />
        <el-table-column label="Điểm giống nhau" align="center" prop="point_similarity" />
        <el-table-column label="Tác giả" align="center" prop="author" />
        <el-table-column label="Số like" align="center" prop="like_count">
        </el-table-column>
        <el-table-column label="Số lượt xem" align="center" prop="view_count" width="180">
        </el-table-column>
        <el-table-column label="Số truyện tương tự" align="center" prop="count_book_similarity" width="180" />
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
          <span style="font-weight: bold">Truyện phổ biến</span>
        </div>
        <el-table :data="dataPopular" border style="width: 100%" :header-cell-style="{ background: '#a8b03e' }">
          <el-table-column label="ID" align="center" prop="id"></el-table-column>
          <el-table-column label="Tên truyện" align="left" prop="title"></el-table-column>
          <el-table-column label="Điểm trung bình đánh giá" align="center" prop="rating__avg"></el-table-column>
          <el-table-column label="Tác giả" align="center" prop="author"></el-table-column>
          <el-table-column label="Số user đánh giá" align="center" prop="user_id__count"></el-table-column>
          <el-table-column label="Số lượt thích" align="center" prop="like_count"></el-table-column>
          <el-table-column label="Số lượt xem" align="center" prop="view_count"></el-table-column>
        </el-table>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import { listRecommender, listPopular } from "@/api/vadmin/system/book/recommender";

export default {
  name: "Chapter",
  components: { listRecommender, listPopular },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      totalPopular: 0,
      dataList: [],
      dataPopular: [],
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
    getFiles(event) {
      this.files = event.target.files[0];
      const urls = this.files;
      console.log(urls);
      console.log(this.files);
    },
    getList() {
      this.loading = true;
      const userId = this.$route.params && this.$route.params.userId;
      console.log("AAAA: " + userId);
      listRecommender(userId).then((response) => {
        this.dataList = response.data.results;
        console.log("Result is: " + JSON.stringify(response.data));
        this.total = response.data.count;
        this.loading = false;
      });
      listPopular(userId).then((response) => {
        this.dataPopular = response.data.results;
        console.log("Result popular is: " + JSON.stringify(response.data));
        this.totalPopular = response.data.count;
        this.loading = false;
      });
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    handleQuery() {
      let bookId = "";
      this.listBookOptions.map((val) => {
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
