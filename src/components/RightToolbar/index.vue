<template>
  <div class="top-right-btn">
    <el-row>
      <el-tooltip class="item" effect="dark" :content="showSearch ? 'Ẩn tìm kiếm' : 'Hiển thị tìm kiếm'" placement="top">
        <el-button size="mini" circle icon="el-icon-search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="Reset" placement="top">
        <el-button size="mini" circle icon="el-icon-refresh" @click="refresh()" />
      </el-tooltip>
      <el-tooltip v-if="columns" class="item" effect="dark" content="Ẩn data" placement="top">
        <el-button size="mini" circle icon="el-icon-menu" @click="showColumn()" />
      </el-tooltip>
    </el-row>
    <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-transfer
        v-model="value"
        :titles="['Hiện', 'Ẩn']"
        :data="columns"
        @change="dataChange"
      />
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "RightToolbar",
  props: {
    showSearch: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array
    }
  },
  data() {
    return {
      value: [],
      title: "Hiện ẩn",
      open: false
    };
  },

  methods: {
    toggleSearch() {
      this.$emit("update:showSearch", !this.showSearch);
    },
    refresh() {
      this.$emit("queryTable");
    },
    dataChange(data) {
      for (var item in this.columns) {
        const key = this.columns[item].key;
        this.columns[item].visible = !data.includes(key);
      }
    },
    showColumn() {
      this.open = true;
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep .el-transfer__button {
  border-radius: 50%;
  padding: 12px;
  display: block;
  margin-left: 0px;
}
::v-deep .el-transfer__button:first-child {
  margin-bottom: 10px;
}
</style>
