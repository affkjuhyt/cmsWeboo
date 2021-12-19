<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
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
      <el-form-item label="Người tạo" prop="creator_name" label-width="90px">
        <el-select
          v-model="queryParams.creator_name"
          placeholder="Người tạo"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in listCreator"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Search</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:savefile:post']"
          type="primary"
          plain
          icon="el-icon-upload"
          size="mini"
          @click="handleAdd"
        >Tải ảnh lên
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:savefile:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Xóa hàng loạt
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:clearsavefile:post']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleClear"
        >Dọn dẹp các tệp lỗi thời
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Số thứ tự" width="90" align="center" prop="id" />
      <el-table-column label="Tên truyện" width="150" align="center" prop="name_book" />
      <el-table-column label="Tên post" width="150" align="center" prop="" />
      <el-table-column label="Tên chương" width="150" align="center" prop="name_chapter" />
      <el-table-column label="Nguồn tập tin" align="center" prop="image" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.image"
            :preview-src-list="scope.row.image"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:clearsavefile:download:post'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
        width="130"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:clearsavefile:download:post']"
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleDownload(scope.row)"
          >Tải xuống
          </el-button>
          <el-button
            v-hasPermi="['system:savefile:{id}:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >Xóa
          </el-button>
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
    <el-dialog :title="title" :visible.sync="open" width="400px" append-to-body @close="submitForm">
      <FileUpload ref="saveFile" :file-type="['ALL']" @input="submitForm" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { clearSaveFile, delSaveFile, listSaveFile } from "@/api/vadmin/system/savefile";
import { clearImageFile, delImageFile, listImageFile, listImageFileFilter } from "@/api/vadmin/system/image/data";
import { listBook } from "@/api/vadmin/system/book/data";
import { getChapters } from "@/api/vadmin/system/book/chapter";
import FileUpload from "@/components/FileUpload/index";

export default {
  name: "Savefile",
  components: { FileUpload },
  data() {
    return {
      loading: true,
      showSearch: true,
      single: true,
      multiple: true,
      title: "",
      open: false,
      listBookOptions: [],
      chapterBookOptions: [],
      listCreator: [{ label: "admin", value: "admin" }, { label: "editor", value: "editor" }],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        name_chapter: undefined,
        creator_name: undefined,
        type: undefined
      },
      total: 0,
      fileList: []
    };
  },
  created() {
    this.getList();
    this.getBookList();
  },
  mounted() {
  },
  methods: {
    getImage(imagePath) {
      return require(imagePath);
    },
    getList() {
      this.loading = true;
      listImageFile(this.queryParams).then(response => {
        this.fileList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      });
    },
    getListQuery() {
      this.loading = true;
      listImageFileFilter(this.queryParams).then(response => {
        this.fileList = response.results;
        this.total = response.count;
        this.loading = false;
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
    handleQuery() {
      this.getListQuery();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd(row) {
      this.open = true;
      this.title = "Thêm file";
    },
    handleDownload(row) {
      this.download(row.file_url, row.name);
    },
    handleDelete(row) {
      const userIds = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa tệp "' + userIds + '"?', "Cảnh báo", {
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Hủy bỏ",
        type: "warning"
      }).then(function() {
        return delImageFile(userIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleClear() {
      this.$confirm("Thao tác này sẽ xóa tất cả các tệp không tồn tại trong cơ sở dữ liệu, bao gồm cả các tệp trong OSS. Bạn có chắc chắn muốn xóa các tệp bị loại bỏ không?", "Cảnh báo", {
        confirmButtonText: "Chắc chắn",
        cancelButtonText: "Hủy bỏ",
        type: "warning"
      }).then(function() {
        return clearImageFile();
      }).then((values) => {
        this.getList();
        this.msgSuccess(values.msg);
      });
    },
    submitForm: function() {
      this.getList();
      this.open = false;
      this.$refs.saveFile.fileList = [];
    },
    CopyFileUrl(values) {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.setAttribute("value", values);
      input.select();
      if (document.execCommand("copy")) {
        document.execCommand("copy");
        this.msgSuccess("Sao chép thành công");
      }
      document.body.removeChild(input);
    }
  }

};
</script>

<style scoped>
  @import url("//unpkg.com/element-ui@2.13.0/lib/theme-chalk/index.css");
</style>
