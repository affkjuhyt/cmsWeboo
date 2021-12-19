<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "../../../dashboard/mixins/resize";
import { getRegisterUser } from "@/api/vadmin/permission/user";

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
      getRegisterUser().then(response => {
        this.chart.setOption({
          xAxis: {
            data: [response.data[0]["key"], response.data[1]["key"], response.data[2]["key"], response.data[3]["key"], response.data[4]["key"], response.data[5]["key"], response.data[6]["key"], response.data[7]["key"], response.data[8]["key"], response.data[9]["key"], response.data[10]["key"], response.data[11]["key"]],
            boundaryGap: false,
            axisTick: {
              show: false
            }
          },
          title: {
            text: "Số lượt đăng kí theo tháng",
            fontSize: 10
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
            data: ["Số lượt đăng kí"]
          },
          series: [{
            name: "Số lượt đăng kí",
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
            data: [response.data[0]["value"], response.data[1]["value"], response.data[2]["value"], response.data[3]["value"], response.data[4]["value"], response.data[5]["value"], response.data[6]["value"], response.data[7]["value"], response.data[8]["value"], response.data[9]["value"], response.data[10]["value"], response.data[11]["value"]],
            animationDuration: 2800,
            animationEasing: "quadraticOut"
          }]
        });
      });
    }
  }
};
</script>
