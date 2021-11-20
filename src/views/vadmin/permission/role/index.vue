<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="Tên vai trò" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="Vui lòng nhập tên vai trò"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Ký tự quyền" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="Vui lòng nhập các tự quyền"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Tình trạng vai trò"
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
      <el-form-item label="Thời gian tạo">
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
          v-hasPermi="['permission:role:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['permission:role:{id}:put']"
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
          v-hasPermi="['permission:role:{id}:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >Xóa</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['permission:role:export:get']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >Xuất</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="STT" prop="id" width="80px" />
      <el-table-column label="Tên vai trò" prop="roleName" :show-overflow-tooltip="true" />
      <el-table-column label="Ký tự quyền" prop="roleKey" :show-overflow-tooltip="true" />
      <el-table-column label="Thứ tự hiển thị" prop="roleSort" width="120px" align="center" />
      <el-table-column label="Trạng thái" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="1"
            inactive-value="0"
            disabled
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['permission:role:{id}:put', 'permission:role:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['permission:role:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa</el-button>
          <el-button
            v-hasPermi="['permission:role:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            @click="handleDataScope(scope.row)"
          >Quyền dữ liệu</el-button>
          <el-button
            v-hasPermi="['permission:role:{id}:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >Xóa bỏ</el-button>
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

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Tên vai trò" prop="roleName">
          <el-input v-model="form.roleName" placeholder="Vui lòng nhập tên vai trò" />
        </el-form-item>
        <el-form-item label="Ký tự quyền" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="Vui lòng nhập các ký tự quyền" />
        </el-form-item>
        <el-form-item label="Thứ tự các vai trò" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Quyền trình đơn">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">Mỏ rộng/thu hẹp</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">Chọn tất cả/Bỏ chọn tất cả</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">Tính cha con</el-checkbox>
          <el-tree
            ref="menu"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="Đang tải, vui lòng đợi"
            :props="defaultProps"
          />
        </el-form-item>
        <el-form-item label="Nhận xét">
          <el-input v-model="form.remark" type="textarea" placeholder="Vui lòng nhập nội dung" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Gửi</el-button>
        <el-button @click="cancel">Hủy</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="Tên vai trò">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="Ký tự quyền">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="Phạm vi quyền hạn">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.dataScope == 2" label="Quyền dữ liệu">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">Mở rộng/thu hẹp</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">Chọn tất cả/ bỏ chọn tất cả</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">Tính cha con</el-checkbox>
          <el-tree
            ref="dept"
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="Đang tải, vui lòng đợi"
            :props="defaultProps"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">Gửi</el-button>
        <el-button @click="cancelDataScope">Hủy</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, getRole, delRole, addRole, updateRole, exportRole, dataScope, changeRoleStatus } from "@/api/vadmin/permission/role";
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/vadmin/permission/menu";
import { roleDeptTreeselect } from "@/api/vadmin/permission/dept";

export default {
  name: "Role",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      roleList: [],
      title: "",
      open: false,
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      dateRange: [],
      statusOptions: [],
      dataScopeOptions: [
        {
          value: "1",
          label: "Tất cả quyền dữ liệu"
        },
        {
          value: "2",
          label: "Quyền đối với dữ liệu chính"
        },
        {
          value: "3",
          label: "Cơ quan dữ liệu của bộ phận này"
        },
        {
          value: "4",
          label: "Cơ quan dữ liệu của bộ phận này trở xuống"
        },
        {
          value: "5",
          label: "Chỉ truy cập dữ liệu cá nhân"
        }
      ],
      menuOptions: [],
      deptOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      rules: {
        roleName: [
          { required: true, message: "Không được để trống tên vai trò", trigger: "blur" }
        ],
        roleKey: [
          { required: true, message: "Ký tự quyền không được để trống", trigger: "blur" }
        ],
        roleSort: [
          { required: true, message: "Thứ tự của các vai trò không được để trống", trigger: "blur" }
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
      listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.roleList = response.data.results;
          this.total = response.data.count;
          this.loading = false;
        }
      );
    },
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = this.handleTree(response.data, "id");
      });
    },
    getMenuAllCheckedKeys() {
      const checkedKeys = this.$refs.menu.getCheckedKeys();
      const halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    getDeptAllCheckedKeys() {
      const checkedKeys = this.$refs.dept.getCheckedKeys();
      const halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    getRoleMenuTreeselect(id) {
      return roleMenuTreeselect(id).then(response => {
        this.menuOptions = this.handleTree(response.data.menus, "id");
        return response;
      });
    },
    getRoleDeptTreeselect(id) {
      return roleDeptTreeselect(id).then(response => {
        this.deptOptions = this.handleTree(response.data.depts, "id");
        return response;
      });
    },
    handleStatusChange(row) {
      const text = row.status === "1" ? "Cho phép" : "Hủy kích hoạt";
      this.$confirm('Xác nhận để"' + text + '""' + row.roleName + '"vai trò?', "Cảnh báo", {
        confirmButtonText: "Đảm bảo",
        cancelButtonText: "Hủy bỏ",
        type: "warning"
      }).then(function() {
        return changeRoleStatus(row.id, row.status);
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    reset() {
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.menuExpand = false;
      this.menuNodeAll = false;
      this.deptExpand = true;
      this.deptNodeAll = false;
      this.form = {
        id: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: this.selectDictDefault(this.statusOptions),
        menu: [],
        dept: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
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
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleCheckedTreeExpand(value, type) {
      if (type == "menu") {
        const treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      } else if (type == "dept") {
        const treeList = this.deptOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    handleCheckedTreeNodeAll(value, type) {
      if (type == "menu") {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
      } else if (type == "dept") {
        this.$refs.dept.setCheckedNodes(value ? this.deptOptions : []);
      }
    },
    handleCheckedTreeConnect(value, type) {
      if (type == "menu") {
        this.form.menuCheckStrictly = !!value;
      } else if (type == "dept") {
        this.form.deptCheckStrictly = !!value;
      }
    },
    handleAdd() {
      this.reset();
      this.getMenuTreeselect();
      this.open = true;
      this.title = "Thêm vai trò";
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      const roleMenu = this.getRoleMenuTreeselect(id);
      getRole(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.$nextTick(() => {
          roleMenu.then(res => {
            const checkedKeys = res.data.checkedKeys;
            checkedKeys.forEach((v) => {
              this.$nextTick(() => {
                this.$refs.menu.setChecked(v, true, false);
              });
            });
          });
        });
        this.title = "Sửa đổi vai trò";
      });
    },
    dataScopeSelectChange(value) {
      if (value !== "2") {
        this.$refs.dept.setCheckedKeys([]);
      }
    },
    handleDataScope(row) {
      this.reset();
      const roleDeptTreeselect = this.getRoleDeptTreeselect(row.id);
      getRole(row.id).then(response => {
        this.form = response.data;
        this.openDataScope = true;
        this.$nextTick(() => {
          roleDeptTreeselect.then(res => {
            this.$refs.dept.setCheckedKeys(res.data.checkedKeys);
          });
        });
        this.title = "Chỉ định quyền giữ liệu";
      });
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.form.menu = this.getMenuAllCheckedKeys();
            updateRole(this.form).then(response => {
              this.msgSuccess("Đã sửa đổi thành công");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.menu = this.getMenuAllCheckedKeys();
            addRole(this.form).then(response => {
              this.msgSuccess("Thêm thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    submitDataScope: function() {
      if (this.form.id !== undefined) {
        this.form.dept = this.getDeptAllCheckedKeys();
        dataScope(this.form).then(response => {
          this.msgSuccess("Đã sửa đổi thành công");
          this.openDataScope = false;
          this.getList();
        });
      }
    },
    handleDelete(row) {
      const roleIds = row.id || this.ids;
      this.$confirm('Bạn có chắc chắn xóa số vai trò không"' + roleIds + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy bỏ",
        type: "warning"
      }).then(function() {
        return delRole(roleIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("Bạn có chắc chắn xuất tất cả các mục dữ liệu vai trò không?", "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy bỏ",
        type: "warning"
      }).then(function() {
        return exportRole(queryParams);
      }).then(response => {
        this.download(response.data.file_url, response.data.name);
      });
    }
  }
};
</script>
