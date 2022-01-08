<template>
  <div class="app-container">
    <el-row :gutter="32">
      <el-col :span="32" :xs="12">
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="Tên tài khoản" prop="username" label-width="120px">
            <el-input
              v-model="queryParams.username"
              placeholder="Nhập tên tài khoản"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="Số điện thoại" prop="phone_number" label-width="120px">
            <el-input
              v-model="queryParams.phone_number"
              placeholder="Nhập số điện thoại"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="Trạng thái" prop="is_active" label-width="90px">
            <el-select
              v-model="queryParams.is_active"
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
          </el-form-item>
          <el-form-item v-if="false" label="Thời gian tạo">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="Thời gian bắt đầu"
              end-placeholder="Thời gian kết thúc"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['permission:user:post']"
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
              v-hasPermi="['permission:user:{id}:put']"
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
              v-hasPermi="['permission:user:{id}:delete']"
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
              v-hasPermi="['permission:user:import:post']"
              type="info"
              plain
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
            >Nhập dữ liệu
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['permission:user:export:get']"
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >Xuất dữ liệu
            </el-button>
          </el-col>
          <right-toolbar :show-search.sync="showSearch" :columns="columns" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" key="id" label="Tên người dùng" align="center" prop="id" />
          <el-table-column
            v-if="columns[1].visible"
            key="username"
            label="Tên tài khoản"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            key="name"
            label="Tên người dùng"
            align="center"
            prop="name"
            :show-overflow-tooltip="true" >
            <template slot-scope="scope">
              <router-link :to="hasPermi(['rec:cb:user:{id}:get']) ?'/permission/recommender/' + scope.row.id :'#'" class="link-type">
                <span>{{ scope.row.name }}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns[3].visible"
            key="role"
            label="Vai trò liên kết"
            align="center"
            prop="dept.role"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <template v-if="scope.row.role.length > 0">
                <el-dropdown>
                  <span class="el-dropdown-link">{{ scope.row.role[0].roleName }}
                    <i class="el-icon-arrow-down el-icon--right" />
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(role,index) in scope.row.role" :key="index">{{ role.roleName }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
              <template v-else>
                <span>Không có vai trò liên quan</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns[4].visible"
            key="phone_number"
            label="Số điện thoại"
            align="center"
            prop="phone_number"
            width="120"
          />
          <el-table-column v-if="columns[5].visible" key="is_active" label="Trạng thái" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.is_active"
                disabled
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="columns[6].visible" label="Thời gian tạo" align="center" prop="create_datetime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.create_datetime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="hasPermi(['permission:user:{id}:put','permission:user:{id}:delete','permission:user:resetpwd:put'])"
            label="Hành động"
            align="center"
            width="160"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['permission:user:{id}:put']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >Chỉnh sửa
              </el-button>
              <el-button
                v-if="scope.row.id !== 1"
                v-hasPermi="['permission:user:{id}:delete']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >Xóa
              </el-button>
              <el-button
                v-hasPermi="['permission:user:resetpwd:put']"
                size="mini"
                type="text"
                icon="el-icon-key"
                @click="handleResetPwd(scope.row)"
              >Cài lại
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
      </el-col>
    </el-row>

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-form-item label="Tên của người dùng" prop="name" label-width="180px">
            <el-input v-model="form.name" placeholder="Vui lòng nhập tên của người dùng" />
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Mobile" prop="mobile">
              <el-input v-model="form.mobile" placeholder="Vui long nhap so dien thoai" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="Vui long nhap email" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.id == undefined" label="Tên" prop="username">
              <el-input v-model="form.username" placeholder="Vui long nhap ten" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.id == undefined" label="Password" prop="password" label-width="100px">
              <el-input v-model="form.password" placeholder="Password" type="password" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Gender">
              <el-select v-model="form.gender" placeholder="Gender">
                <el-option
                  v-for="dict in sexOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Status">
              <el-radio-group v-model="form.is_active">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Role">
              <el-select v-model="form.roleIds" multiple placeholder="Role">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id"
                  :disabled="item.status == 0"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="Remark">
              <el-input v-model="form.remark" type="textarea" placeholder="Remark" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
        <el-button @click="cancel">Hủy</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          Kéo tệp vào đây hoặc
          <em>Bấm tải lên</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          <el-checkbox v-model="upload.updateSupport" />
          Có cập nhật dữ liệu người dùng hiện có hay không
          <el-link type="info" style="font-size:12px" @click="importTemplate">Tải xuống mẫu</el-link>
        </div>
        <div slot="tip" class="el-upload__tip" style="color:red">Mẹo: Chỉ cho phép nhập tệp định dạng "xls" hoặc "xlsx"！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">Gửi</el-button>
        <el-button @click="upload.open = false">Upload</el-button>
      </div>
    </el-dialog>

    <el-divider />

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <LinerChart />
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>

<script>
import {
  addUser,
  changeUserStatus,
  delUser,
  exportUser,
  getUser,
  importsUser,
  importTemplate,
  listUser,
  resetUserPwd,
  updateUser
} from "@/api/vadmin/permission/user";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/vadmin/permission/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import LinerChart from "./userLineChart";
import PieChart from "./userPieChart";

export default {
  name: "User",
  components: { Treeselect, LinerChart, PieChart },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      userList: null,
      title: "",
      deptOptions: undefined,
      open: false,
      deptName: undefined,
      initPassword: undefined,
      dateRange: [],
      statusOptions: [{ dictLabel: "Normal", dictValue: true }, { dictLabel: "Hủy kích hoạt", dictValue: false }],
      sexOptions: [],
      roleOptions: [],
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      upload: {
        open: false,
        title: "",
        isUploading: false,
        updateSupport: 0,
        headers: { Authorization: "Bearer " + getToken() },
        url: process.env.VUE_APP_BASE_API + "/admin/system/savefile/"
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        mobile: undefined,
        is_active: undefined,
        deptId: undefined
      },
      columns: [
        { key: 0, label: `tên người dùng`, visible: true },
        { key: 1, label: `tên tài khoản`, visible: true },
        { key: 2, label: `Biệt hiệu của người dùng`, visible: true },
        { key: 3, label: `Vai trò liên kết`, visible: true },
        { key: 4, label: `số điện thoại`, visible: true },
        { key: 5, label: `Status`, visible: true },
        { key: 6, label: `Thời gian tạo`, visible: true }
      ],
      rules: {
        username: [
          { required: true, message: "Tên tài khoản không được để trông", trigger: "blur" }
        ],
        name: [
          { required: true, message: "Tên của người dùng không được để trống", trigger: "blur" }
        ],
        password: [
          { required: true, message: "Mật khẩu người dùng không được để trống", trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "'Vui lòng nhập địa chỉ email chính xác",
            trigger: ["blur", "change"]
          }
        ],
        mobile: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "Vui lòng nhập số điện thoại chính xác",
            trigger: "blur"
          }
        ]
      }
    };
  },
  watch: {
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
    // this.getDicts("sys_normal_disable").then(response => {
    //   this.statusOptions = response.data;
    // });
    this.getDicts("sys_user_sex").then(response => {
      this.sexOptions = response.data;
    });
    this.getConfigKey("sys.user.initPassword").then(response => {
      this.initPassword = response.msg;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.data.results;
        this.total = response.data.count;
        this.loading = false;
      }
      );
    },
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = this.handleTree(response.data, "id");
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    handleStatusChange(row) {
      const text = row.is_active === true ? "Cho phép" : "Hủy kích hoạt";
      this.$confirm('Xác nhận để"' + text + '""' + row.username + '"Người sử dụng?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return changeUserStatus(row.id, row.is_active);
      }).then(() => {
        this.msgSuccess(text + "Thành công");
      }).catch(function() {
        row.is_active = row.is_active === false;
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: undefined,
        deptId: undefined,
        username: undefined,
        name: undefined,
        password: undefined,
        mobile: undefined,
        email: undefined,
        gender: undefined,
        is_active: false,
        remark: undefined,
        roleIds: []
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.queryParams.deptId = "";
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.getTreeselect();
      getUser().then(response => {
        this.roleOptions = response.data.roles;
        this.open = true;
        this.title = "Thêm người dùng";
        this.form.password = this.initPassword;
      });
    },
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const id = row.id || this.ids;
      getUser(id).then(response => {
        const data = response.data.data;
        data["roleIds"] = response.data.roleIds;
        this.form = data;
        this.roleOptions = response.data.roles;
        this.open = true;
        this.title = "Sửa đổi người dùng";
        this.form.password = "";
      });
    },
    handleResetPwd(row) {
      this.$prompt('Vui lòng nhập"' + row.username + '"Mật khẩu mới', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy"
      }).then(({ value }) => {
        resetUserPwd(row.id, value).then(response => {
          this.msgSuccess("Sửa đổi thành công và mật khẩu mới là:" + value);
        });
      }).catch(() => {
      });
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateUser(this.form).then(response => {
              this.msgSuccess("Chỉnh sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then(response => {
              this.msgSuccess("Thêm user thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const userIds = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa ID người dùng như"' + userIds + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delUser(userIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu người dùng không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return exportUser(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    },
    handleImport() {
      this.upload.title = "Nhập người dùng";
      this.upload.open = true;
    },
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    },
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      importsUser({ file_url: response.data.file_url, updateSupport: this.upload.updateSupport }).then(response => {
        this.$alert("Đã nhập thành công", "nhập kết quả", { dangerouslyUseHTMLString: true });
        this.getList();
      });
    },
    submitFileForm() {
      this.$refs.upload.submit();
    }
  }
};
</script>
