<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="Địa chỉ đăng nhập" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="Vui lòng nhập địa chỉ đăng nhập"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên tài khoản" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="Vui lòng nhập tên người dùng"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm kiếm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>

    </el-form>
    <el-table
      v-loading="loading"
      :data="list.slice((pageNum-1)*pageSize,pageNum*pageSize)"
      style="width: 100%;"
    >
      <el-table-column label="Số seri" type="index" align="center">
        <template slot-scope="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TokenId" align="center" prop="tokenId" :show-overflow-tooltip="true" />
      <el-table-column label="Tên tài khoản" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="Phòng ban" align="center" prop="deptName" />
      <el-table-column label="Địa chỉ IP" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="Vị trí đăng nhập" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="Trình duyệt" align="center" prop="browser" />
      <el-table-column label="Hệ điều hành" align="center" prop="os" />
      <el-table-column label="Thời gian đăng nhập" align="center" prop="loginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hành động" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['monitor:online:forceLogout']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleForceLogout(scope.row)"
          >Logout</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
  </div>
</template>

<script>
import { list, forceLogout } from "@/api/vadmin/monitor/online";

export default {
  name: "Online",
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      pageNum: 1,
      pageSize: 10,
      queryParams: {
        ipaddr: undefined,
        userName: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      list(this.queryParams).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleForceLogout(row) {
      this.$confirm('Bạn có xác nhận rằng tên của lệnh rút tiền bắt buộc là"' + row.userName + '"Mục dữ liệu?', "Cảnh báo", {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning"
      }).then(function() {
        return forceLogout(row.tokenId);
      }).then(() => {
        this.getList();
        this.msgSuccess("Buộc phải thoát thành công");
      });
    }
  }
};
</script>

