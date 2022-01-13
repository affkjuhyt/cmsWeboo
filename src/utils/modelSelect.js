import store from "@/store";
export const getModelSelect = async(modelName, labelName, listApi, params, reset) => {
  await store.dispatch("modelSelect/getModelSelect", { modelName, labelName, listApi, params, reset });
  return store.getters["modelSelect/getModelSelect"][modelName];
};
