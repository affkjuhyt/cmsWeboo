<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <span slot="label">Tạo mẫu</span>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option label="Bảng đơn (thêm, xóa, sửa đổi và kiểm tra)" value="crud" />
            <el-option label="Bảng cây (thêm, xóa, sửa đổi, truy vấn)" value="tree" />
            <el-option label="Bảng chính và bảng phụ (thêm, xóa, sửa đổi và kiểm tra)" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <span slot="label">
            Tạo đường dẫn gói
            <el-tooltip content="Gói java nào được tạo, ví dụ: com.ruoyi.system" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <span slot="label">
            Tạo tên mô-đun
            <el-tooltip content="Có thể hiểu là tên của hệ thống con, chẳng hạn như hệ thống" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <span slot="label">
            Tạo tên doanh nghiệp
            <el-tooltip content="Có thể hiểu là tên tiếng Anh của hàm, chẳng hạn như user" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <span slot="label">
            Tạo tên hàm
            <el-tooltip content="Được sử dụng làm mô tả lớp, ví dụ: người dùng" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            Menu phía trên
            <el-tooltip content="Được chỉ định cho menu được chỉ định, chẳng hạn như quản lý hệ thống" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <treeselect
            v-model="info.parentMenuId"
            :append-to-body="true"
            :options="menus"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="Vui lòng chọn menu hệ thống"
          />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <span slot="label">
            Phương pháp tạo mã
            <el-tooltip content="Mặc định là tải xuống gói nén zip, bạn cũng có thể tùy chỉnh đường dẫn tạo" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-radio v-model="info.genType" label="0">kho lưu trữ zip</el-radio>
          <el-radio v-model="info.genType" label="1">Đường dẫn tùy chỉnh</el-radio>
        </el-form-item>
      </el-col>

      <el-col v-if="info.genType == '1'" :span="24">
        <el-form-item prop="genPath">
          <span slot="label">
            Đường dẫn tùy chỉnh
            <el-tooltip content="Điền vào đường dẫn tuyệt đối của đĩa, nếu không được điền, nó sẽ được tạo trong dự án Web hiện tại" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-input v-model="info.genPath">
            <el-dropdown slot="append">
              <el-button type="primary">
                Lựa chọn nhanh con đường gần nhất
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="info.genPath = '/'">Khôi phục đường dẫn cơ sở thế hệ mặc định</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row v-show="info.tplCategory == 'tree'">
      <h4 class="form-header">Thông tin khác</h4>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            Trường mã hóa cây
            <el-tooltip content="Tên trường mã được hiển thị trong cây, chẳng hạn như dept_id" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-select v-model="info.treeCode" placeholder="xin vui lòng chọn">
            <el-option
              v-for="(column, index) in info.columns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            Trường mã hóa gốc cây
            <el-tooltip content="Tên của trường mã mẹ được hiển thị trong cây, chẳng hạn như: parent_Id" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-select v-model="info.treeParentCode" placeholder="xin vui lòng chọn">
            <el-option
              v-for="(column, index) in info.columns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            Trường tên cây
            <el-tooltip content="Tên trường hiển thị tên của nút cây, chẳng hạn như: dept_name" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-select v-model="info.treeName" placeholder="xin vui lòng chọn">
            <el-option
              v-for="(column, index) in info.columns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-show="info.tplCategory == 'sub'">
      <h4 class="form-header">Thông tin liên quan</h4>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            Tên bảng của bảng con được liên kết
            <el-tooltip content="Tên bảng của bảng con được liên kết, chẳng hạn như sys_user" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-select v-model="info.subTableName" placeholder="xin vui lòng chọn" @change="subSelectChange">
            <el-option
              v-for="(table, index) in tables"
              :key="index"
              :label="table.tableName + '：' + table.tableComment"
              :value="table.tableName"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            Tên của khóa ngoại được liên kết với bảng con
            <el-tooltip content="Tên của khóa ngoại được liên kết với bảng con, chẳng hạn như user_id" placement="top">
              <i class="el-icon-question" />
            </el-tooltip>
          </span>
          <el-select v-model="info.subTableFkName" placeholder="xin vui lòng chọn">
            <el-option
              v-for="(column, index) in subColumns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "BasicInfoForm",
  components: { Treeselect },
  props: {
    info: {
      type: Object,
      default: null
    },
    tables: {
      type: Array,
      default: null
    },
    menus: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      subColumns: [],
      rules: {
        tplCategory: [
          { required: true, message: "Vui lòng chọn một mẫu thế hệ", trigger: "blur" }
        ],
        packageName: [
          { required: true, message: "Vui lòng nhập đường dẫn của gói bản dựng", trigger: "blur" }
        ],
        moduleName: [
          { required: true, message: "Vui lòng nhập tên của mô-đun đã tạo", trigger: "blur" }
        ],
        businessName: [
          { required: true, message: "Vui lòng nhập tên doanh nghiệp đã tạo", trigger: "blur" }
        ],
        functionName: [
          { required: true, message: "Vui lòng nhập tên của hàm đã tạo", trigger: "blur" }
        ]
      }
    };
  },
  watch: {
    "info.subTableName": function(val) {
      this.setSubTableColumns(val);
    }
  },
  created() {},
  methods: {
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      };
    },
    subSelectChange(value) {
      this.info.subTableFkName = "";
    },
    tplSelectChange(value) {
      if (value !== "sub") {
        this.info.subTableName = "";
        this.info.subTableFkName = "";
      }
    },
    setSubTableColumns(value) {
      for (var item in this.tables) {
        const name = this.tables[item].tableName;
        if (value === name) {
          this.subColumns = this.tables[item].columns;
          break;
        }
      }
    }
  }
};
</script>
