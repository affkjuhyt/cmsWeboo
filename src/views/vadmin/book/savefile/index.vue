<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tên tập tin" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="Vui lòng nhập tên tệp"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Loại tệp" prop="type">
        <el-input
          v-model="queryParams.type"
          placeholder="Vui lòng nhập loại tệp"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
        >Tải tệp lên
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
      <el-table-column label="Thư mục số" width="90" align="center" prop="id" />
      <el-table-column label="Tên tập tin" width="200" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="Loại tệp" width="150" align="center" prop="type" />
      <el-table-column label="Kích thước tệp" width="90" align="center" prop="size" />
      <el-table-column label="Khu vực lưu trữ" align="center" prop="address" />
      <el-table-column label="Nguồn tập tin" align="center" prop="source" />
      <el-table-column label="Địa chỉ đích" align="center" prop="file" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.file"
            size="mini"
            type="text"
            icon="el-icon-document-copy"
            @click="CopyFileUrl(scope.row.file)"
          />
          &nbsp;
          <span>{{ scope.row.file }}</span>
        </template>
      </el-table-column>
      <el-table-column label="OSS" align="center" prop="oss_url" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.oss_url"
            size="mini"
            type="text"
            icon="el-icon-document-copy"
            @click="CopyFileUrl(scope.row.oss_url)"
          />
          &nbsp;
          <span>{{ scope.row.oss_url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
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
import { clearSaveFile, delSaveFile, listSaveFile } from "@/api/vadmin/system/savefile";
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
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        type: undefined
      },
      total: 0,
      fileList: []
    };
  },
  created() {
    this.getList();
  },
  mounted() {
  },
  methods: {
    getList() {
      this.loading = true;
      listSaveFile(this.queryParams).then(response => {
        this.fileList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      });
    },
    handleQuery() {
      this.getList();
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
        return delSaveFile(userIds);
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
        return clearSaveFile();
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

</style>
