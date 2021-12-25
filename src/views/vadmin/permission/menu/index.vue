<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="Tên menu" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="Nhập tên menu"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Loại menu" prop="menuType">
        <el-select v-model="queryParams.menuType" placeholder="Loại menu" clearable size="small">
          <el-option
            v-for="dict in menuTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="queryParams.status" placeholder="Trạng thái menu" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['permission:menus:post']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >Thêm mới
        </el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" label="Menu" :show-overflow-tooltip="true" width="220px" />
      <el-table-column prop="icon" label="Icon" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon || ''" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="Loại" width="60" />
      <el-table-column prop="menuType" label="Loại menu" :formatter="menuTypeFormat" width="100px" />
      <el-table-column prop="component_path" align="center" label="Đường dẫn thành phần" :show-overflow-tooltip="true" />
      <!--      <el-table-column prop="interface_path" label="接口路径" :show-overflow-tooltip="true"></el-table-column>-->
      <!--      <el-table-column prop="interface_method" label="请求方式" :formatter="interfaceMethodFormat" width="70"></el-table-column>-->
      <el-table-column prop="status" label="Status" :formatter="statusFormat" width="120px" />
      <!-- <el-table-column label="Thời gian cập nhật" align="center" prop="update_datetime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.update_datetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thời gian tạo" align="center" prop="create_datetime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.create_datetime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column
        v-if="hasPermi(['permission:menus:{id}:put', 'permission:menus:post', 'permission:menus:{id}:delete'])"
        label="Hành động"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['permission:menus:{id}:put']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >Chỉnh sửa
          </el-button>
          <el-button
            v-hasPermi="['permission:menus:post']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >Thêm
          </el-button>
          <el-button
            v-hasPermi="['permission:menus:{id}:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >Xóa
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="Menu phía trên">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="Chọn menu phía trên"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Loại menu" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="0">Nội dung</el-radio>
                <el-radio label="1">Menu</el-radio>
                <el-radio label="2">Nút</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menuType != '2'" label="Biểu tượng menu">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" placeholder="Nhấp vào biểu tượng chọn" readonly>
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px;width: 16px;"
                  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.menuType == '2'?'Tên menu':'Tên nút'" prop="name">
              <el-input v-model="form.name" placeholder="Vui lòng nhập tên menu" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Sắp xếp hiển thị" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menuType != '2'" label="Có liên kết không">
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">Đúng</el-radio>
                <el-radio label="1">Sai</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="Địa chỉ định tuyến" prop="web_path">
              <el-input v-model="form.web_path" placeholder="Vui lòng nhập địa chỉ định tuyến giao diện người dùng" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != '2'" :span="12">
            <el-form-item label="Đường dẫn thành phần" prop="component_path" label-width="170px">
              <el-input v-model="form.component_path" placeholder="Vui lòng nhập đường dẫn thành phần front-end" @change="ComponentPathChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '0'" label="Đường dẫn giao diện" prop="interface_path">
              <el-input v-model="form.interface_path" placeholder="Vui lòng nhập đường dẫn giao diện back-end" @change="InterfacePathChange" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType != '0'" :span="12">
            <el-form-item label="Yêu cầu phương thức" prop="interface_method">
              <el-select
                v-model="form.interface_method"
                placeholder="Vui lòng chọn phương thức yêu cầu phụ trợ"
                clearable
                size="small"
                @change="CreatePerms"
              >
                <el-option
                  v-for="dict in interfaceMethodOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="Trạng thái hiển thị">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in visibleOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != '2'" label="Trạng thái menu">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType == '1'" label="Có lưu vào bộ nhớ cache không?">
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">Không lưu vào bộ nhớ cache</el-radio>
                <el-radio label="1">Bộ nhớ đệm</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Chắc chắn</el-button>
        <el-button @click="cancel">Hủy bỏ</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from "@/api/vadmin/permission/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "Menu",
  components: { Treeselect, IconSelect },
  data() {
    return {
      loading: true,
      showSearch: true,
      menuList: [],
      menuOptions: [],
      title: "",
      open: false,
      visibleOptions: [],
      statusOptions: [],
      menuTypeOptions: [],
      interfaceMethodOptions: [],
      queryParams: {
        name: undefined,
        visible: undefined,
        pageNum: "all"
      },
      form: {},
      rules: {
        name: [
          { required: true, message: "Tên menu không được để trống", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "Thứ tự menu không được để trống", trigger: "blur" }
        ],
        web_path: [
          { required: true, message: "Địa chỉ định tuyến không được để trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_show_hide").then(response => {
      this.visibleOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_menu_type").then(response => {
      this.menuTypeOptions = response.data;
    });
    this.getDicts("sys_interface_method").then(response => {
      this.interfaceMethodOptions = response.data;
    });
  },
  methods: {
    selected(name) {
      this.form.icon = name;
    },
    InterfacePathChange() {
      if (this.form.interface_path.length === 0) {
        this.form.perms = "";
        return;
      }
      if (this.form.interface_path.indexOf("/") !== 0) {
        this.form.interface_path = "/" + this.form.interface_path;
      }
      if (!this.form.interface_path.endsWith("/")) {
        this.form.interface_path = this.form.interface_path + "/";
      }
      this.CreatePerms();
    },
    CreatePerms() {
      const res = this.form.interface_path + ":" + this.form.interface_method;
      this.form.perms = res.toLocaleLowerCase().replace(/(\/)/g, ":").replace(/(::)/g, ":").replace(/(^:)|(:$)/g, "");
    },
    ComponentPathChange() {
      this.form.component_path = this.form.component_path.replace(/(^\/)/g, "");
    },
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data, "id");
        this.loading = false;
      });
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    getTreeselect() {
      listMenu({ pageNum: "all" }).then(response => {
        this.menuOptions = [];
        const menu = { id: 0, name: "Danh mục chính", children: [] };
        menu.children = this.handleTree(response.data, "id");
        this.menuOptions.push(menu);
      });
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    menuTypeFormat(row, column) {
      return this.selectDictLabel(this.menuTypeOptions, row.menuType);
    },
    interfaceMethodFormat(row, column) {
      return this.selectDictLabel(this.interfaceMethodOptions, row.interface_method);
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: undefined,
        parentId: 0,
        name: undefined,
        icon: undefined,
        web_path: undefined,
        menuType: this.selectDictDefault(this.menuTypeOptions),
        orderNum: undefined,
        component_path: undefined,
        interface_path: undefined,
        perms: undefined,
        interface_method: this.selectDictDefault(this.interfaceMethodOptions),
        isFrame: "1",
        isCache: "1",
        visible: this.selectDictDefault(this.visibleOptions),
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
      this.getTreeselect();
      if (row != null && row.id) {
        this.form.parentId = row.id;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = "Thêm menu";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa đổi menu";
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
          if (this.form.id != undefined) {
            updateMenu(cloneData).then(response => {
              this.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addMenu(cloneData).then(response => {
              this.msgSuccess("Thêm mới thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      this.$confirm('Bạn có chắc chắn xóa"' + row.name + '"mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return delMenu(row.id);
      }).then(() => {
        this.getList();
        this.msgSuccess("Xóa thành công");
      });
    }
  }
};
</script>
