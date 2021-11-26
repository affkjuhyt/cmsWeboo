<template>
  <div class="instrument-board">
    <div v-if="showTopTitle && haveMultipleData" class="instrument-board-title">
      <el-select
        :value="topTitle"
        @change="chooseDisplayInstrumentBoardData"
      >
        <el-option
          v-for="(item,index) in instrumentBoardData"
          :key="index"
          :label="item.name || item['dir_name']"
          :value="index"
        />
      </el-select>

    </div>
    <div v-else-if="showTopTitle" class="instrument-board-title">
      {{ topTitle }}
    </div>

    <div :id="ringGraphId" class="instrument-board-body" />
    <div
      v-if="showSubTitle"
      class="instrument-board-subtitle"
      :title="subTitle.title"
    >{{ subTitle.content }}
    </div>
  </div>
</template>

<script>
import VueTypes from "vue-types";
const echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/gauge");

const NORMAL_COLOR = {
  color: "#28BCFE",
  itemColor: ["#25bfff", "#5284de", "#2a95f9"]
};
const WARNING_COLOR = {
  color: "#e6a23c",
  itemColor: ["#e6a23c", "#cc8b1d", "#ffaf18"]
};
const DANGER_COLOR = {
  color: "#F56C6C",
  itemColor: ["#fd666d", "#cf1717", "#b31212"]
};

export default {
  name: "InstrumentBoard",
  props: {
    ringGraphKey: VueTypes.string.isRequired,
    showTopTitle: VueTypes.bool.def(false),
    showSubTitle: VueTypes.bool.def(false),
    topTitleKeyToNameMapping: VueTypes.object.def({
      cpu: "CPU đang sử dụng",
      memory: "Memory sử dụng"
    }),
    instrumentBoardData: VueTypes.any.isRequired
  },
  data() {
    return {
      currentInstrumentBoardData: {}
    };
  },
  computed: {
    haveMultipleData() {
      return this.instrumentBoardData instanceof Array && this.instrumentBoardData.length > 0;
    },
    ringRate() {
      let ringRate = this.currentInstrumentBoardData.rate;
      ringRate = ringRate < 1 ? ringRate * 100 : ringRate;
      return parseFloat(ringRate.toFixed(4));
    },
    ringGraphId() {
      return `${this.ringGraphKey}UsingRate`;
    },
    topTitle() {
      return this.currentInstrumentBoardData["dir_name"] || this.topTitleKeyToNameMapping[this.ringGraphKey] || this.ringGraphKey;
    },
    subTitle() {
      const used = this.currentInstrumentBoardData["used"] ? this.currentInstrumentBoardData["used"] + "/" : "";
      const total = this.currentInstrumentBoardData["total"] ? this.currentInstrumentBoardData["total"] : "";
      const unit = this.currentInstrumentBoardData["unit"] ? ` (${this.currentInstrumentBoardData["unit"]})` : "";
      const content = `${used}${total}${unit} `;
      const title = (this.currentInstrumentBoardData["used"] ? "已用/" : "") + "总量(单位)";
      return { content, title };
    },
    usingRateStyle() {
      return {
        fontSize: 18,
        ...this.getCircleColor(this.ringRate)
      };
    }
  },
  mounted() {
    if (this.haveMultipleData) {
      this.currentInstrumentBoardData = this.instrumentBoardData[0];
    } else {
      this.currentInstrumentBoardData = this.instrumentBoardData;
    }
    this.drawBar();
  },
  methods: {
    drawBar() {
      const currentRate = [this.ringRate];
      const RingGraph = echarts.init(document.getElementById(this.ringGraphId));

      const option = {
        title: {
          text: currentRate + "%",
          textStyle: this.usingRateStyle,
          itemGap: 10,
          left: "center",
          top: "45%"
        },
        angleAxis: {
          max: 100,
          clockwise: true,
          show: false
        },
        radiusAxis: {
          type: "category",
          show: true,
          axisLabel: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        polar: {
          center: ["50%", "50%"],
          radius: "100%"
        },
        series: [{
          type: "bar",
          data: currentRate,
          showBackground: true,
          backgroundStyle: {
            color: "#BDEBFF"
          },
          coordinateSystem: "polar",
          roundCap: true,
          barWidth: 15,
          itemStyle: {
            normal: {
              opacity: 1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: this.usingRateStyle.itemColor[0] || "#25BFFF"
              }, {
                offset: 1,
                color: this.usingRateStyle.itemColor[1] || "#5284DE"
              }]),
              shadowBlur: 1,
              shadowColor: this.usingRateStyle.itemColor[2] || "#2A95F9"
            }
          }
        }]
      };
      RingGraph.setOption(option);
    },
    getCircleColor(usingRate) {
      if (usingRate < 60) {
        return NORMAL_COLOR;
      } else if (usingRate > 60 && usingRate < 80) {
        return WARNING_COLOR;
      } else if (usingRate > 80) {
        return DANGER_COLOR;
      }
      return NORMAL_COLOR;
    },
    chooseDisplayInstrumentBoardData(index) {
      this.currentInstrumentBoardData = this.instrumentBoardData[index];
      this.drawBar();
    }
  }

};
</script>

<style scoped>
.instrument-board-title {
  font-weight: bolder;
  text-align: center;
}

.instrument-board-body {
  min-height: 200px;
  min-width: 200px;
}

.instrument-board-subtitle {
  text-align: center;
}
</style>
