<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
import { getPercentUserVip } from "@/api/vadmin/permission/user";
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
      getPercentUserVip().then(response => {
        this.dataPieChart = response.data;
      });
    },
    initChart() {
      getPercentUserVip().then(response => {
        this.dataPieChart = response.data[0];

        this.chart = echarts.init(this.$el, "macarons");
        this.chart.setOption({
          title: {
            text: "Phần trăm user vip"
          },
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            left: "center",
            bottom: "10",
            data: [response.data[0]["key"], response.data[1]["key"]]
          },
          series: [
            {
              name: "Thể loại truyện",
              type: "pie",
              roseType: "radius",
              radius: [15, 95],
              center: ["50%", "38%"],
              data: [
                { value: response.data[0]["value"], name: response.data[0]["key"] },
                { value: response.data[1]["value"], name: response.data[1]["key"] }
              ],
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
