<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
import { getPostPieChart } from "@/api/vadmin/system/post/data";
require("echarts/theme/macarons"); // echarts theme
import resize from "../../../dashboard/mixins/resize";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "300px"
    }
  },
  data() {
    return {
      chart: null
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    getList() {
      getPostPieChart().then(response => {
        this.dataPieChart = response.data;
      });
    },
    initChart() {
      getPostPieChart().then(response => {
        this.dataPieChart = response.data[0];

        this.chart = echarts.init(this.$el, "macarons");
        this.chart.setOption({
          title: {
            text: "Thống kê theo nhóm",
            left: "center",
            bottom: "10px"
          },
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          // legend: {
          //   left: "center",
          //   bottom: "10",
          //   data: [response.data[0]["key"],
          //     response.data[1]["key"],
          //     response.data[2]["key"],
          //     response.data[3]["key"],
          //     response.data[4]["key"],
          //     response.data[5]["key"],
          //     response.data[6]["key"],
          //     response.data[7]["key"]
          //   ]
          // },
          series: [
            {
              name: "Số bài viết trong",
              type: "pie",
              roseType: "radius",
              radius: [15, 95],
              center: ["50%", "38%"],
              data: [
                { value: response.data[0]["value"], name: response.data[0]["key"] },
                { value: response.data[1]["value"], name: response.data[1]["key"] },
                { value: response.data[2]["value"], name: response.data[2]["key"] },
                { value: response.data[3]["value"], name: response.data[3]["key"] },
                { value: response.data[4]["value"], name: response.data[4]["key"] },
                { value: response.data[5]["value"], name: response.data[5]["key"] },
                { value: response.data[6]["value"], name: response.data[6]["key"] },
                { value: response.data[7]["value"], name: response.data[7]["key"] }
              ],
              backgroudColors: ["#5C4742", "#A5978B", "#8D5B4C", "#5A2A27", "#C4BBAF"],
              animationEasing: "cubicInOut",
              animationDuration: 2600
            }
          ]
        });
      });
    }
  }
};
</script>
