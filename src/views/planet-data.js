export const planetChartData = {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Số lượng bài viết",
        data: [0, 76.654, 102.542, 2, 79, 82, 27, 56, 23, 13, 34, 98],
        backgroundColor: "rgba(113,163,217,.5)",
        borderColor: "#4e89c7",
        borderWidth: 1
      },
      {
        label: "Số lượng tương tác",
        data: [287, 87, 54, 90, 954, 285, 43, 87, 12, 87, 88, 95],
        backgroundColor: "rgba(71, 183,132,.5)",
        borderColor: "#47b784",
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    lineTension: 100,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            padding: 90
          }
        }
      ]
    }
  }
};

export default planetChartData;
