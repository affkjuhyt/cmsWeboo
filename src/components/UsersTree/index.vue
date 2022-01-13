<template>
  <div>
    <treeselect
      v-model="users_value"
      :options="usersOptions"
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
import { listUser } from "@/api/vadmin/permission/user";

export default {
  name: "DeptTree",
  components: { Treeselect },
  props: {
    // eslint-disable-next-line vue/require-prop-type-constructor
    value: { type: Number | Array },
    placeholder: { type: String, default: "Vui lòng chọn một người dùng" },
    multiple: { type: Boolean, default: false },
    disable_branch_nodes: { type: Boolean, default: false }
  },
  data() {
    return {
      usersOptions: [],
      users_value: ""
    };
  },
  watch: {
    users_value(newValue) {
      this.$emit("update:value", newValue);
    },
    value: {
      handler: function(newValue) {
        this.users_value = newValue;
      },
      immediate: true
    }
  },
  created() {
    this.getTreeselect();
  },
  methods: {
    getTreeselect() {
      listUser({ pageNum: "all", _fields: "id,name" }).then(response => {
        response.data.map(val => { val["label"] = val["name"]; });
        this.usersOptions = this.handleTree(response.data, "id");
      });
    }
  }

};
</script>

<style scoped>

</style>
