<template>
  <div class="app-container">
    <div class="server-monitor-control">
      <div class="control-server-monitor same-block">
        Bật giám sát
        <el-switch
          v-model="isOpeningMonitor"
          active-color="#13ce66"
          inactive-color="#ff4949"
          title="Kiểm soát tất cả các hạng mục giám sát"
          @change="changeMonitorStatus"
        />
      </div>
      <div class="monitor-update-interval same-block">
        Tần suất giám sát
        <el-input-number
          v-model="monitorUpdateInterval"
          label=""
          class="monitor-update-interval-blank"
          controls-position="right"
          :min="minMonitorUpdateInterval"
          @input="handleIntervalChange"
        />
        <el-select
          v-model="intervalType"
          class="monitor-update-interval-unit"
          @change="selectIntervalType"
        >
          <el-option
            v-for="item in Object.keys(INTERVAL_ID_TO_TYPE_MAPPING)"
            :key="INTERVAL_ID_TO_TYPE_MAPPING[item].type"
            :label="INTERVAL_ID_TO_TYPE_MAPPING[item].name"
            :value="INTERVAL_ID_TO_TYPE_MAPPING[item].name"
          />
        </el-select>

      </div>
      <div class="monitor-log-save-time same-block">
        Save days
        <el-input v-model="monitorLogSavingDays" class=" same-block" style="width: 70px;" />
        <el-button
          type="primary"
          class="same-block"
          title="Chỉ các thay đổi cam kết mới có hiệu lực"
          @click="updateMonitorStatusSettingsInfo"
        >Thay đổi
        </el-button>
      </div>
      <div class="clean-monitor-log same-block">
        <el-button
          class="same-block"
          type="warning"
          title="Xóa tất cả hồ sơ giám sát"
          @click="cleanMonitorLogsInfo"
        >Xóa hồ sơ
        </el-button>
      </div>
    </div>

    <div class="server-monitor-top">
      <el-card class="box-card server-information">
        <div slot="header" class="clearfix">
          <div class="server-info-item">Máy chủ </div>
          <el-select
            filterable
            :value="currentServerName"
            class="server-info-item"
            placeholder="Vui lòng chọn máy chủ"
            @change="chooseServerInfo"
          >
            <el-option
              v-for="(item,index) in allServerInfo"
              :key="item.id"
              :label="item.name || item.ip"
              :value="index"
            />
          </el-select>
          <el-button
            type="primary"
            class="server-info-item"
            title="Chỉ các thay đổi cam kết mới có hiệu lực"
            @click="updateServerInfo"
          >Thay đổi
          </el-button>
        </div>
        <div class="server-info-detail">
          <div v-for="(key,index) in currentServerInfoKeys" :key="index" class="server-info-detail-line text item">
            <div class="server-info-detail-item">
              <div style="width: 30%;display: inline-block;">{{ SERVER_KEY_TO_NAME_MAPPING[key] }}:</div>
              <div v-if="CHANGEABLE_SERVER_FIELDS.indexOf(key) > -1" style="display: inline-block;">
                <el-input v-model="currentServer[key]" style="display: inline-block; width: 90%;" />
              </div>
              <div v-else style="display: inline-block; "> {{ currentServer[key] }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card
        v-for="(key, index) of Object.keys(instrumentBoardData)"
        :key="`${index}-${key}`"
        class="box-card information-instrument-panel"
      >
        <instrument-board
          :show-top-title="true"
          :show-sub-title="true"
          :ring-graph-key="key"
          :instrument-board-data="instrumentBoardData[key]"
          :top-title-key-to-name-mapping="INSTRUMENT_BOARD_KEY_TO_NAME_MAPPING"
        />
      </el-card>
    </div>
    <div class="server-monitor-bottom">
      <el-card
        v-for="(key, index) in Object.keys(lineChartData).slice(0,2)"
        :key="`${index}-${key}`"
        class="box-card server-monitor-line-chart"
      >
        <line-chart
          :line-chart-key="key"
          :server-info="currentServer"
          :chart-title="CHART_KEY_NAME_MAPPING[key]"
          :chart-data="lineChartData[key]"
          :chart-time="lineChartData['datetime']"
        />
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  cleanMonitorLog,
  getMonitorLogs,
  getMonitorStatusInfo,
  getServerLatestLog,
  getServerList,
  updateMonitorStatusInfo,
  updateServerInfo
} from "@/api/vadmin/monitor/server";
import InstrumentBoard from "@/views/vadmin/monitor/server/components/InstrumentBoard";
import LineChart from "@/views/vadmin/monitor/server/components/LineChart";
import moment from "moment";

const debounce = require("lodash/debounce");

const SERVER_KEY_TO_NAME_MAPPING = {
  ip: "IP máy chủ",
  name: "Tên máy chủ",
  os: "Hệ điều hành",
  remark: "Nhận xét"
};

const INTERVAL_ID_TO_TYPE_MAPPING = {
  0: {
    type: 0,
    name: "giây",
    key: "seconds",
    second: 1
  },
  1: {
    type: 1,
    name: "phút",
    key: "minutes",
    second: 60
  },
  2: {
    type: 2,
    name: "giờ",
    key: "hours",
    second: 60 * 60
  },
  3: {
    type: 3,
    name: "ngày",
    key: "days",
    second: 24 * 60 * 60
  }
};
const defaultUpdateInterval = INTERVAL_ID_TO_TYPE_MAPPING["0"];

const CHART_KEY_NAME_MAPPING = {
  cpu: "CPU",
  memory: "RAM",
  disk: "Đĩa"
};

const INSTRUMENT_BOARD_KEY_TO_NAME_MAPPING = {
  cpu: "Sử dụng CPU",
  memory: "Sử dụng bộ nhớ"
};

const CHANGEABLE_SERVER_FIELDS = ["name", "remark"];

export default {
  name: "Server",
  components: {
    InstrumentBoard,
    LineChart
  },
  data() {
    return {
      SERVER_KEY_TO_NAME_MAPPING,
      INTERVAL_ID_TO_TYPE_MAPPING,
      CHART_KEY_NAME_MAPPING,
      CHANGEABLE_SERVER_FIELDS,
      INSTRUMENT_BOARD_KEY_TO_NAME_MAPPING,
      timeRange: [
        `${moment().format("YYYY-MM-DD")} 00:00:00`,
        `${moment().format("YYYY-MM-DD")} 23:59:59`
      ],
      loading: [],
      allServerInfo: [],
      currentServerName: "",
      currentServer: {},
      currentServerIndex: 0,
      isOpeningMonitor: false,
      monitorUpdateInterval: 60,
      minMonitorUpdateInterval: 0,
      intervalType: defaultUpdateInterval.name,
      intervalTypeUnits: defaultUpdateInterval.second,
      monitorLogSavingDays: 30,
      lineChartData: {},
      instrumentBoardData: {}
    };
  },
  computed: {
    currentServerInfoKeys() {
      return Object.keys(this.currentServer).filter(key => {
        if (SERVER_KEY_TO_NAME_MAPPING[key]) {
          return { [key]: SERVER_KEY_TO_NAME_MAPPING[key] };
        }
      });
    },
    intervalNameToSecondMapping() {
      const intervalNameToSecondMapping = {};
      Object.values(INTERVAL_ID_TO_TYPE_MAPPING).forEach(item => {
        intervalNameToSecondMapping[item.name] = item.second;
      });
      return intervalNameToSecondMapping;
    },
    monitorStatusInfo() {
      return {
        enabled: this.isOpeningMonitor ? 1 : 0,
        save_days: this.monitorLogSavingDays,
        interval: this.monitorUpdateInterval * this.intervalTypeUnits
      };
    }
  },
  watch: {
    currentServer(newServerInfo) {
      if (newServerInfo) {
        this.getServerLatestLogInfo(newServerInfo.id);
        this.getCurrentServerMonitorLogs();
      }
    }
  },
  created() {
    this.openLoading();
    this.getServerList(this.currentServerIndex);
    this.getMonitorStatusSettingsInfo();
  },
  methods: {
    getServerList(serverIndex) {
      getServerList({ pageNum: "all" }).then(response => {
        this.allServerInfo = response.data;
        if (this.allServerInfo.length > 0) {
          this.currentServer = this.allServerInfo[serverIndex || this.currentServerIndex];
          this.currentServerName = this.currentServer.name || this.currentServer.ip;
        }
        this.loading.close();
      });
    },
    updateServerInfo() {
      updateServerInfo(this.currentServer.id, this.currentServer).then(() => {
        this.msgSuccess("Sửa đổi thông tin máy chủ thành công!");
      }).catch(error => {
        this.$message.error(error.msg || "Lỗi khi gửi để sửa đổi thông tin máy chủ!");
      }).finally(() => {
        this.getServerList();
      });
    },
    getServerLatestLogInfo(serverId) {
      getServerLatestLog(serverId).then(results => {
        this.instrumentBoardData = results.data;
      }).catch(error => {
        this.msgError(error.msg || "Nhận thông tin giám sát mới nhất của lỗi máy chủ!");
      });
    },
    getCurrentServerMonitorLogs() {
      getMonitorLogs(this.currentServer.id, { as: JSON.stringify({ "create_datetime__range": this.timeRange }) }).then(results => {
        this.lineChartData = results.data;
      }).catch(error => {
        this.msgError(error.msg || "Lỗi khi lấy thông tin nhật ký giám sát!");
      });
    },

    cleanMonitorLogsInfo() {
      this.$confirm("Thao tác này sẽ xóa tất cả các bản ghi giám sát. Bạn có muốn tiếp tục không?", "Cảnh báo", {
        confirmButtonText: "Xác nhận xóa",
        cancelButtonText: "Hủy"
      }).then(() => {
        cleanMonitorLog().then(results => {
          this.msgSuccess("Xóa hồ sơ thành công!");
        }).catch(error => {
          this.$message.warning(error.msg || "Không thể xóa hồ sơ, vui lòng thử lại!");
        });
      }).catch(() => {
      });
    },

    getMonitorStatusSettingsInfo() {
      getMonitorStatusInfo().then(results => {
        const { enabled, interval, save_days } = results.data;
        this.isOpeningMonitor = enabled;
        this.monitorLogSavingDays = parseInt(save_days);
        this.formatInterval(parseInt(interval));
      }).catch(error => {
        this.msgError(error.msg || "Đã xảy ra lỗi khi lấy thông tin cấu hình giám sát máy chủ!");
      });
    },
    updateMonitorStatusSettingsInfo() {
      updateMonitorStatusInfo(this.monitorStatusInfo).then(() => {
        this.msgSuccess("Đã cập nhật cấu hình thành công!");
      }).catch((error) => {
        this.msgError(error.msg || "Lỗi khi cập nhật thông tin cấu hình giám sát máy chủ!");
      });
    },

    openLoading() {
      this.loading = this.$loading({
        lock: true,
        text: "Đọc một cách tuyệt vọng",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
    },
    chooseServerInfo(index) {
      this.currentServerIndex = index;
      this.currentServer = this.allServerInfo[index];
      this.currentServerName = this.currentServer.name || this.currentServer.ip;
    },
    handleIntervalChange: debounce(function(value) {
      this.monitorUpdateInterval = value;
    }, 500),
    selectIntervalType(value) {
      this.intervalType = value;
      this.intervalTypeUnits = this.intervalNameToSecondMapping[value];
    },
    changeMonitorStatus(value) {
      this.isOpeningMonitor = value;
    },
    formatInterval(intervalTime) {
      let biggerInterval = 0;
      for (const interval of Object.values(INTERVAL_ID_TO_TYPE_MAPPING)) {
        if (interval.second > biggerInterval && interval.second < intervalTime) {
          biggerInterval = interval.second;
          this.monitorUpdateInterval = intervalTime / interval.second;
          this.intervalType = interval.name;
          this.intervalTypeUnits = interval.second;
        }
      }
    }
  }
};
</script>
<style scoped>
.el-button--medium {
  margin: 2px;
  padding: 10px 10px;
}

.server-monitor-top {
  padding: 10px 10px;
  text-align: justify-all;
  overflow-x: scroll;
  display: flex;
}

.server-monitor-bottom {
  text-align: left;
  overflow-x: scroll;
  display: flex;
}

.server-information {
  width: 31%;
  min-width: 400px;
  min-height: 300px;
  display: inline-block;
  margin-top: 30px;
}

.information-instrument-panel {
  width: 20%;
  display: inline-block;
  min-height: 300px;
  min-width: 300px;
  margin: 0 10px;
}

.server-info-item {
  display: inline-block;
  margin: 0 5px;
}

.server-info-detail {
  min-height: 200px;
}

.server-info-detail-line {
  margin: 5px;
  min-height: 20px;
}

.server-info-detail-item {
  text-align: justify;
  line-height: 40px;
  margin: 4px 0;
  overflow: auto;
}

.server-monitor-control {
  width: 100%;
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
}

.monitor-update-interval {
  margin: 0 20px;
}

.same-block {
  display: inline-block;
}

.monitor-update-interval-blank {
  width: 100px;
  margin: 0 2px;
}

.monitor-update-interval-unit {
  width: 80px;
  margin: 0 2px;
}

.monitor-log-save-time {
  width: 280px;
  margin: 0 2px;
}

.clean-monitor-log {
}

.server-monitor-line-chart {
  height: 400px;
  width: 45%;
  min-width: 500px;
  margin: 10px;
  display: inline-block;
  overflow-x: scroll;
}

</style>
