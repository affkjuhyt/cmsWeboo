<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "../../../dashboard/mixins/resize";
import { getBookBarChart } from "@/api/vadmin/system/dashboard";

const animationDuration = 6000;

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
      getBookBarChart().then(response => {
        console.log(this.dataBarChart);
        this.dataBarChart = response.data;
      });
    },
    initChart() {
      getBookBarChart().then(response => {
        console.log(response.data[0]);

        this.chart = echarts.init(this.$el, "macarons");

        this.chart.setOption({
          title: {
            text: "Số lượng truyện thêm mới",
            left: "center",
            top: "20px"
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross"
            }
          },
          grid: {
            top: 10,
            left: "2%",
            right: "2%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: [{
            type: "category",
            data: [response.data[0]["key"], response.data[1]["key"], response.data[2]["key"], response.data[3]["key"], response.data[4]["key"], response.data[5]["key"], response.data[6]["key"], response.data[7]["key"], response.data[8]["key"], response.data[9]["key"], response.data[10]["key"], response.data[11]["key"]],
            axisTick: {
              alignWithLabel: true
            }
          }],
          yAxis: [{
            type: "value",
            axisTick: {
              show: false
            }
          }],
          series: [{
            name: "Số lượt truyện thêm mới",
            type: "bar",
            stack: "vistors",
            barWidth: "50%",
            data: [
              response.data[0]["value"],
              response.data[1]["value"],
              response.data[2]["value"],
              response.data[3]["value"],
              response.data[4]["value"],
              response.data[5]["value"],
              response.data[6]["value"],
              response.data[7]["value"],
              response.data[8]["value"],
              response.data[9]["value"],
              response.data[10]["value"],
              response.data[11]["value"]
            ],
            backgroundColor: "#f89098",
            animationDuration
          }]
        });
      });
    }
  }
};
</script>
