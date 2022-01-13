<template>
  <div>
    <treeselect
      v-model="dept_value"
      :options="deptTree"
      :multiple="multiple"
      :show-count="true"
      :placeholder="placeholder"
      :disable-branch-nodes="disable_branch_nodes"
    />
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { treeselect } from "@/api/vadmin/permission/dept";

export default {
  name: "DeptTree",
  components: { Treeselect },
  props: {
    // eslint-disable-next-line vue/require-prop-type-constructor
    value: { type: Number | Array },
    placeholder: { type: String, default: "Vui lòng chọn bộ phận" },
    multiple: { type: Boolean, default: false },
    disable_branch_nodes: { type: Boolean, default: false }
  },
  data() {
    return {
      deptOptions: [],
      deptTree: [],
      dept_value: ""
    };
  },
  watch: {
    dept_value(newValue) {
      this.$emit("update:value", newValue);
    },
    value: {
      handler: function(newValue) {
        this.dept_value = newValue;
      },
      immediate: true
    }
  },
  created() {
    this.getTreeselect();
  },
  methods: {
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
        this.deptTree = this.handleTree(response.data, "id");
      });
    }
  }

};
</script>

<style scoped>

</style>
