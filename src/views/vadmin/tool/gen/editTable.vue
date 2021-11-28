<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Thông tin cơ bản" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="Thông tin cột" name="cloum">
        <el-table ref="dragTable" :data="cloumns" row-key="columnId" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" class-name="allowDrag" />
          <el-table-column
            label="Tên cột dọc"
            prop="columnName"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Mô tả lĩnh vực" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnComment" />
            </template>
          </el-table-column>
          <el-table-column
            label="Loại vật lý"
            prop="columnType"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Java" min-width="11%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.javaField" />
            </template>
          </el-table-column>

          <el-table-column label="Chèn" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isInsert" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="Sửa" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isEdit" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="Danh sách" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isList" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="Query" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isQuery" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="Chế độ" min-width="10%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Yêu cầu" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isRequired" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="Kiểu hiển thị" min-width="12%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="Input" value="input" />
                <el-option label="Textarea" value="textarea" />
                <el-option label="Select" value="select" />
                <el-option label="Radio" value="radio" />
                <el-option label="Checkbox" value="checkbox" />
                <el-option label="Datetime" value="datetime" />
                <el-option label="Upload" value="imageUpload" />
                <el-option label="FileUpload" value="fileUpload" />
                <el-option label="Editor" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Loại từ điển" min-width="12%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.dictType" clearable filterable placeholder="xin vui lòng chọn">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType"
                >
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Tạo thông tin" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" :tables="tables" :menus="menus" />
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="submitForm()">Gửi</el-button>
        <el-button @click="close()">Hủy</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { getGenTable, updateGenTable } from "@/api/vadmin/tool/gen";
import { optionselect as getDictOptionselect } from "@/api/vadmin/system/dict/type";
import { listMenu as getMenuTreeselect } from "@/api/vadmin/permission/menu";
import basicInfoForm from "./basicInfoForm";
import genInfoForm from "./genInfoForm";
import Sortable from "sortablejs";

export default {
  name: "GenEdit",
  components: {
    basicInfoForm,
    genInfoForm
  },
  data() {
    return {
      activeName: "cloum",
      tableHeight: document.documentElement.scrollHeight - 245 + "px",
      tables: [],
      cloumns: [],
      dictOptions: [],
      menus: [],
      info: {}
    };
  },
  created() {
    const tableId = this.$route.params && this.$route.params.tableId;
    if (tableId) {
      getGenTable(tableId).then(res => {
        this.cloumns = res.data.rows;
        this.info = res.data.info;
        this.tables = res.data.tables;
      });
      getDictOptionselect().then(response => {
        this.dictOptions = response.data;
      });
      getMenuTreeselect().then(response => {
        this.menus = this.handleTree(response.data, "menuId");
      });
    }
  },
  mounted() {
    const el = this.$refs.dragTable.$el.querySelectorAll(".el-table__body-wrapper > table > tbody")[0];
    Sortable.create(el, {
      handle: ".allowDrag",
      onEnd: evt => {
        const targetRow = this.cloumns.splice(evt.oldIndex, 1)[0];
        this.cloumns.splice(evt.newIndex, 0, targetRow);
        for (const index in this.cloumns) {
          this.cloumns[index].sort = parseInt(index) + 1;
        }
      }
    });
  },
  methods: {
    submitForm() {
      const basicForm = this.$refs.basicInfo.$refs.basicInfoForm;
      const genForm = this.$refs.genInfo.$refs.genInfoForm;
      Promise.all([basicForm, genForm].map(this.getFormPromise)).then(res => {
        const validateResult = res.every(item => !!item);
        if (validateResult) {
          const genTable = Object.assign({}, basicForm.model, genForm.model);
          genTable.columns = this.cloumns;
          genTable.params = {
            treeCode: genTable.treeCode,
            treeName: genTable.treeName,
            treeParentCode: genTable.treeParentCode,
            parentMenuId: genTable.parentMenuId
          };
          updateGenTable(genTable).then(res => {
            this.msgSuccess(res.msg);
            if (res.code === 200) {
              this.close();
            }
          });
        } else {
          this.msgError("Xác minh biểu mẫu không thành công, vui lòng kiểm tra lại nội dung đã gửi");
        }
      });
    },
    getFormPromise(form) {
      return new Promise(resolve => {
        form.validate(res => {
          resolve(res);
        });
      });
    },
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.push({ path: "/tool/gen", query: { t: Date.now() }});
    }
  }
};
</script>
