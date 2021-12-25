<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "../../../dashboard/mixins/resize";
import { getLineChart } from "@/api/vadmin/system/comment/data";

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
      default: "350px"
    },
    autoResize: {
      type: Boolean,
      default: true
    }
    // chartData: {
    //   type: Object,
    //   required: true
    // }
  },
  data() {
    return {
      chart: null
    };
  },
  // watch: {
  //   chartData: {
  //     deep: true,
  //     handler(val) {
  //       this.setOptions(val);
  //     }
  //   }
  // },
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
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      this.setOptions(this.chartData);
    },
    setOptions() {
      getLineChart().then(response => {
        console.log("aaa: " + JSON.stringify(response.data.Mon));
        this.chart.setOption({
          xAxis: {
            data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            boundaryGap: false,
            axisTick: {
              show: false
            }
          },
          grid: {
            left: 10,
            right: 10,
            bottom: 20,
            top: 30,
            containLabel: true
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross"
            },
            padding: [5, 10]
          },
          yAxis: {
            axisTick: {
              show: false
            }
          },
          legend: {
            data: ["Thực tế"]
          },
          series: [{
            name: "expected", itemStyle: {
              normal: {
                color: "#FF005A",
                lineStyle: {
                  color: "#FF005A",
                  width: 2
                }
              }
            },
            smooth: true,
            type: "line",
            data: [36, 15, 13, 22, 40, 9, 10],
            animationDuration: 2800,
            animationEasing: "cubicInOut"
          }]
        });
      });
    }
  }
};
</script>
