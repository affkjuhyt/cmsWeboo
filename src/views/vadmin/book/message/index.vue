<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Tiêu đề thông báo" prop="title" label-width="150px">
        <el-input
          v-model="queryParams.title"
          placeholder="Vui lòng nhập tiêu đề của thông báo"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Loại thông báo" prop="message_type" label-width="150px">
        <el-select v-model="queryParams.message_type" placeholder="Loại thông báo" clearable size="small">
          <el-option
            v-for="dict in MessagePushTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Trạng thái thông báo" prop="status" label-width="170px">
        <el-select v-model="queryParams.status" placeholder="Trạng thái thông báo" clearable size="small">
          <el-option
            v-for="dict in MessagePushStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <!--      <el-form-item label="是否审核" prop="is_reviewed">-->
      <!--        <el-select v-model="queryParams.is_reviewed" placeholder="是否审核" clearable size="small">-->
      <!--          <el-option :key="true" label="是" :value="true"/>-->
      <!--          <el-option :key="false" label="否" :value="false"/>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:message:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:message:{id}:put']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >Chỉnh sửa
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['permission:menu:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Xóa
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:message:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Id" align="center" prop="id" />
      <el-table-column label="Title" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="Content" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="Loại thông báo" align="center" prop="message_type" :formatter="typeFormat" />
      <!--      <el-table-column label="是否审核通过" align="center" prop="is_reviewed" :formatter="isReviewedFormat"/>-->
      <el-table-column label="Trạng thái thông báo" align="center" prop="status" :formatter="statusFormat" width="180px" />
      <el-table-column label="Path" align="center" prop="to_path" :show-overflow-tooltip="true" />
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime" width="180px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['system:message:{id}:put','permission:menu:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:message:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa
          </el-button>
          <el-button
            v-hasPermi="['permission:menu:{id}:delete']"
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

    <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Tiêu đề" prop="title">
              <el-input v-model="form.title" placeholder="Vui lòng nhập tiêu đề của thông báo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Path" prop="to_path">
              <el-input v-model="form.to_path" placeholder="Vui lòng nhập path" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in MessagePushStatusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Loại thông báo" prop="message_type" label-width="120px">
              <el-select v-model="form.message_type" placeholder="Xin vui lòng chọn">
                <el-option
                  v-for="dict in MessagePushTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Content" prop="content">
              <editor v-model="form.content" :min-height="192" />
            </el-form-item>
          </el-col>

          <!--        <el-form-item label="是否审核" prop="is_reviewed">-->
          <!--          <el-radio-group v-model="form.is_reviewed">-->
          <!--            <el-radio :label="true">是</el-radio>-->
          <!--            <el-radio :label="false">否</el-radio>-->
          <!--          </el-radio-group>-->
          <!--        </el-form-item>-->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
        <el-button @click="cancel">Hủy</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addMessage, delMessage, exportMessage, getMessage, listMessage, updateMessage } from "@/api/vadmin/system/message";
import Editor from "@/components/Editor";

export default {
  name: "Message",
  components: {
    Editor
  },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      configList: [],
      title: "",
      open: false,
      MessagePushTypeOptions: [],
      MessagePushStatusOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        content: undefined,
        message_type: undefined,
        is_reviewed: undefined,
        status: undefined
      },
      form: {},
      rules: {
        title: [
          { required: true, message: "Tiêu đề thông báo không được để trống", trigger: "blur" }
        ],
        content: [
          { required: true, message: "Nội dung thông báo không được để trống", trigger: "blur" }
        ],
        to_path: [
          { required: false, message: "Đường dẫn bước nhảy không được để trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_message_push_type").then(response => {
      this.MessagePushTypeOptions = response.data;
    });
    this.getDicts("sys_message_push_status").then(response => {
      this.MessagePushStatusOptions = response.data;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listMessage(this.addDateRange(this.queryParams)).then(response => {
        this.configList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      }
      );
    },
    typeFormat(row, column) {
      return this.selectDictLabel(this.MessagePushTypeOptions, row.message_type);
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.MessagePushStatusOptions, row.status);
    },
    isReviewedFormat(row, column) {
      return row.is_reviewed === true ? "Đúng" : "Sai";
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: undefined,
        title: undefined,
        content: undefined,
        to_path: undefined,
        is_reviewed: true,
        message_type: this.selectDictDefault(this.MessagePushStatusOptions),
        status: this.selectDictDefault(this.MessagePushStatusOptions)
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thông báo";
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getMessage(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Thông báo sửa đổi";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateMessage(this.form).then(response => {
              this.msgSuccess("Đã sửa đổi thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addMessage(this.form).then(response => {
              this.msgSuccess("Thêm mới thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const configIds = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số thông báo không"' + configIds + '"?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delMessage(configIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportMessage(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>
