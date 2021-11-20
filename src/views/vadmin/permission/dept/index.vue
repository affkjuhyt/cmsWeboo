<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="Tên bộ phận" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="Vui lòng nhập tên bộ phận"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['permission:dept:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="deptList"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="deptName" label="部门名称" />
      <el-table-column prop="orderNum" label="排序" width="200" />
      <el-table-column prop="status" label="状态" :formatter="statusFormat" width="200" />
      <el-table-column label="更新时间" align="center" prop="update_datetime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.update_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="create_datetime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasPermi(['permission:dept:{id}:put','permission:dept:post','permission:dept:{id}:delete'])"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['permission:dept:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['permission:dept:post']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId !== 0"
            v-hasPermi="['permission:dept:{id}:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="Cấp cao hơn" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên bộ phận" prop="deptName">
              <el-input v-model="form.deptName" placeholder="Vui lòng nhập tên bộ phận" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Sắp xếp hiển thị" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Leader" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số điện thoại" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
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
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/vadmin/permission/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Dept",
  components: { Treeselect },
  data() {
    return {
      loading: true,
      showSearch: true,
      deptList: [],
      deptOptions: [],
      title: "",
      open: false,
      statusOptions: [],
      queryParams: {
        deptName: undefined,
        status: undefined,
        pageNum: "all"
      },
      form: {},
      rules: {
        parentId: [
          { required: true, message: "Bộ phận cấp trên không được để trống", trigger: "blur" }
        ],
        deptName: [
          { required: true, message: "Tên bộ phận không được để trống", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "Sắp xếp hiển thị không được để trống", trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "'Vui lòng nhập địa chỉ email chính xác",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "Vui lòng nhập số điện thoại chính xác",
            trigger: "blur"
          }
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
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, "id");
        this.loading = false;
      });
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.deptName,
        children: node.children
      };
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
        parentId: undefined,
        deptName: undefined,
        orderNum: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: this.selectDictDefault(this.statusOptions)
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd(row) {
      this.reset();
      if (row !== undefined) {
        this.form.parentId = row.id;
      }
      this.open = true;
      this.title = "Thêm bộ phận";
      listDept({ pageNum: "all" }).then(response => {
        this.deptOptions = this.handleTree(response.data, "id");
      });
    },
    handleUpdate(row) {
      this.reset();
      getDept(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa đổi bộ phận";
      });
      listDeptExcludeChild(row.id).then(response => {
        this.deptOptions = this.handleTree(response.data, "id");
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const cloneData = JSON.parse(JSON.stringify(this.form));
          if (cloneData.parentId === 0) {
            delete cloneData["parentId"];
          }
          if (this.form.id !== undefined) {
            updateDept(cloneData).then(response => {
              this.msgSuccess("Đã sửa đổi thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addDept(cloneData).then(response => {
              this.msgSuccess("Thêm thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      this.$confirm('Bạn có chắc chắn xóa tên là"' + row.deptName + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy bỏ",
        type: "warning"
      }).then(function() {
        return delDept(row.id);
      }).then(() => {
        this.getList();
        this.msgSuccess("Đã xóa thành công");
      });
    }
  }
};
</script>
