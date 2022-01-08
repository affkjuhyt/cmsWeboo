<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";
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
      chart: null,
      gradient: null,
      gradient2: null
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
    this.gradient = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);
    this.gradient2 = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);

    this.gradient.addColorStop(0, "rgba(255, 0,0, 0.5)");
    this.gradient.addColorStop(0.5, "rgba(255, 0, 0, 0.25)");
    this.gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

    this.gradient2.addColorStop(0, "rgba(0, 231, 255, 0.9)");
    this.gradient2.addColorStop(0.5, "rgba(0, 231, 255, 0.25)");
    this.gradient2.addColorStop(1, "rgba(0, 231, 255, 0)");
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
            data: ["Mong đợi", "Thực tế"]
          },
          series: [{
            name: "Mong đợi", itemStyle: {
              normal: {
                color: "#FC2525",
                lineStyle: {
                  color: "#FC2525",
                  width: 2
                }
              }
            },
            smooth: true,
            type: "line",
            borderColor: "#FC2525",
            tension: 0.1,
            data: [672, 325, 236, 867, 438, 439, 810],
            animationDuration: 2800,
            animationEasing: "cubicInOut"
          },
          {
            name: "Thực tế",
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                color: "#3888fa",
                lineStyle: {
                  color: "#3888fa",
                  width: 2
                },
                areaStyle: {
                  color: "#f3f8ff"
                }
              }
            },
            data: [response.data.Mon, response.data.Tue, response.data.Wed, response.data.Thu, response.data.Fri, response.data.Sat, response.data.Sun],
            animationDuration: 2800,
            animationEasing: "quadraticOut"
          }]
        });
      });
    }
  }
};
</script>
