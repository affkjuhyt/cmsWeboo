<template>
  <treeselect
    v-model="select_value"
    :options="selectOptions"
    :multiple="multiple"
    :show-count="true"
    :placeholder="placeholder"
    :disable-branch-nodes="disable_branch_nodes"
    style="line-height:20px"
  />
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "ModelSelect",
  components: { Treeselect },
  props: {
    value: { type: Number || Array },
    prop: { type: String },
    placeholder: { type: String, default: "Vui lòng chọn" },
    multiple: { type: Boolean, default: false },
    disable_branch_nodes: { type: Boolean, default: false },
    label_name: { type: String, default: "name" },
    listApi: { type: Function, default: null },
    select_options: { type: Array, default: null }
  },
  data() {
    return {
      selectOptions: [],
      select_value: ""
    };
  },
  watch: {
    select_value(newValue) {
      this.$emit("update:value", newValue);
    },
    value: {
      handler: function(newValue) {
        this.select_value = newValue;
      },
      immediate: true
    },
    select_options: {
      handler: function(newValue) {
        if (newValue) {
          this.selectOptions = this.handleTree(newValue, "id", "parentId");
        }
      },
      immediate: true
    }
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      if (this.select_options) return;
      this.getModelSelect(this.prop, this.label_name, this.listApi).then(response => {
        this.selectOptions = response;
      });
    }
  }

};
</script>

<style>

</style>
