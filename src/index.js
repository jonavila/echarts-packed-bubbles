import echarts from "echarts/lib/echarts";
import "./echarts-extension/packedBubbles";
import styles from "./index.css";

/**
 * Global controller object is described on Zoomdata knowledge base
 * @see https://www.zoomdata.com/developers/docs/custom-chart-api/controller/
 */

/* global controller */

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/creating-chart-container/
 */
const chartContainer = document.createElement("div");
chartContainer.classList.add(styles.chartContainer);
controller.element.appendChild(chartContainer);

const groupAccessor = controller.dataAccessors["Group By"];
const metricAccessor = controller.dataAccessors["Metric"];

const chart = echarts.init(chartContainer);

const option = {
  tooltip: {},
  series: [
    {
      type: "packedBubbles",
      label: {
        show: true
      },
      animationDurationUpdate: 1000
    }
  ]
};

controller.update = data => {
  option.series[0].data = data.map(d => ({
    name: groupAccessor.formatted(d),
    value: metricAccessor.raw(d),
    datum: d
  }));

  chart.setOption(option);
};

controller.resize = echarts.throttle(
  () => {
    chart.resize();
  },
  100,
  true
);

controller.createAxisLabel({
  picks: "Group By",
  orientation: "horizontal",
  position: "bottom",
  popoverTitle: "Group"
});

controller.createAxisLabel({
  picks: "Metric",
  orientation: "horizontal",
  position: "bottom"
});
