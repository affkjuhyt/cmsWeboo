<script>
import { Bubble } from "vue-chartjs";
export default {
  extends: Bubble,
  data() {
    return {
      datacollection: {
        labels: ["Tỉ lệ đánh giá/ thể loại truyện"],
        datasets: [
          {
            label: "Bí ẩn",
            backgroundColor: "#389c5b",
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "#249EBF",
            data: [
              {
                x: 100,
                y: 0,
                r: 10
              },
              {
                x: 60,
                y: 30,
                r: 20
              },
              {
                x: 40,
                y: 60,
                r: 25
              },
              {
                x: 80,
                y: 80,
                r: 50
              },
              {
                x: 20,
                y: 30,
                r: 25
              },
              {
                x: 0,
                y: 100,
                r: 5
              }
            ]
          },
          {
            label: "Ngược luyến",
            backgroundColor: "#edc834",
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "#249EBF",
            data: [
              {
                x: 76,
                y: 0,
                r: 10
              },
              {
                x: 60,
                y: 25,
                r: 20
              },
              {
                x: 10,
                y: 15,
                r: 25
              },
              {
                x: 95,
                y: 50,
                r: 25
              },
              {
                x: 15,
                y: 40,
                r: 15
              },
              {
                x: 5,
                y: 40,
                r: 6
              }
            ]
          },
          {
            label: "Đam mỹ",
            backgroundColor: "#4ab5ae",
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "#249EBF",
            data: [
              {
                x: 76,
                y: 27,
                r: 10
              },
              {
                x: 50,
                y: 86,
                r: 40
              },
              {
                x: 70,
                y: 25,
                r: 15
              },
              {
                x: 87,
                y: 53,
                r: 21
              },
              {
                x: 45,
                y: 20,
                r: 55
              },
              {
                x: 10,
                y: 42,
                r: 3
              }
            ]
          }
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  mounted() {
    this.renderChart(this.datacollection, this.options);
  }
};
</script>
