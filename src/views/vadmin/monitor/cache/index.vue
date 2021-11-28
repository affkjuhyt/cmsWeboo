<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header"><span>Thông tin cơ bản</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td><div class="cell">Redis</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.redis_version }}</div></td>
                  <td><div class="cell">Chế độ hoạt động</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.redis_mode == "standalone" ? "Độc lập" : "Cụm" }}</div></td>
                  <td><div class="cell">Port</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.tcp_port }}</div></td>
                  <td><div class="cell">Clients</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.connected_clients }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">Thời gian chạy (ngày)</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.uptime_in_days }}</div></td>
                  <td><div class="cell">Sử dụng bộ nhớ</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.used_memory_human }}</div></td>
                  <td><div class="cell">Sử dụng CPU</div></td>
                  <td><div v-if="cache.info" class="cell">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div></td>
                  <td><div class="cell">Cấu hình bộ nhớ</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.maxmemory_human }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">AOF có bật hay không</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.aof_enabled == "0" ? "Có" : "Không" }}</div></td>
                  <td><div class="cell">RDB có thành công hay không</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.rdb_last_bgsave_status }}</div></td>
                  <td><div class="cell">Số lượng chính</div></td>
                  <td><div v-if="cache.dbSize" class="cell">{{ cache.dbSize }} </div></td>
                  <td><div class="cell">Vào / ra mạng</div></td>
                  <td><div v-if="cache.info" class="cell">{{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header"><span>Thống kê lệnh</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header">
            <span>Thông tin bộ nhớ</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getCache } from "@/api/vadmin/monitor/cache";
import echarts from "echarts";

export default {
  name: "Server",
  data() {
    return {
      loading: [],
      commandstats: null,
      usedmemory: null,
      cache: []
    };
  },
  created() {
    this.getList();
    this.openLoading();
  },
  methods: {
    getList() {
      getCache().then((response) => {
        this.cache = response.data;
        this.loading.close();

        this.commandstats = echarts.init(this.$refs.commandstats, "macarons");
        this.commandstats.setOption({
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          series: [
            {
              name: "Đặt hàng",
              type: "pie",
              roseType: "radius",
              radius: [15, 95],
              center: ["50%", "38%"],
              data: response.data.commandStats,
              animationEasing: "cubicInOut",
              animationDuration: 1000
            }
          ]
        });
        this.usedmemory = echarts.init(this.$refs.usedmemory, "macarons");
        this.usedmemory.setOption({
          tooltip: {
            formatter: "{b} <br/>{a} : " + this.cache.info.used_memory_human
          },
          series: [
            {
              name: "Giá trị cao",
              type: "gauge",
              min: 0,
              max: 1000,
              detail: {
                formatter: this.cache.info.used_memory_human
              },
              data: [
                {
                  value: parseFloat(this.cache.info.used_memory_human),
                  name: "Tiêu thụ bộ nhớ"
                }
              ]
            }
          ]
        });
      });
    },
    openLoading() {
      this.loading = this.$loading({
        lock: true,
        text: "loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
    }
  }
};
</script>
