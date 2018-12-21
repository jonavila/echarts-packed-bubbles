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


// Auxiliar functions
const getTableRow = (label, value) => `<div class="zd_tooltip_info_table_row"><div class="zd_tooltip_info_table_row_label">${label}</div><div class="zd_tooltip_info_table_row_value">${value}</div></div>`;

const getMetricLabel = data => {
  if (_.has(data, 'label')) {
    const func = _.has(data, 'func') && data.func ? `(${_.replace(data.func, /_/g, ' ')})` : '';
    return `${data.label} ${func}`;
  }
  return '';
}

const getSecondMetric = params => {
  const metric = _.first(controller.query.metrics.toJSON());
  if (_.has(metric, 'name') && _.has(metric, 'func') && metric.name !== 'count' && metric.func) {
    return `<div class="zd_tooltip_info_table_row">${getTableRow('Volume', params.data.datum.current.count)}</div>`;
  }
  return '';
}

const getMetric = (label, params) => {
  const  secondMetric = getSecondMetric(params);
  return `${secondMetric}<div class="zd_tooltip_info_table_row"><div class="zd_tooltip_info_table_row_label">${label}</div><div class="zd_tooltip_info_table_row_value"><div class="color_icon active" style="background-color: ${params.color};"></div>${params.data.value}</div></div>`;
}

const getMetricTooltip = params => {
  if (params && _.has(params, 'name') && _.has(params, 'color') && _.has(params, 'data.value')) {
      const label = _.first(controller.query.groups.toJSON()).label;
      const metric = getMetric(getMetricLabel(_.first(controller.query.metrics.toJSON())), params);
      return `<div class="zd_tooltip_info_group customized"><div class="zd_tooltip_info_table"><div class="zd_tooltip_info_table_row">${getTableRow(label, params.name)}</div>${metric}</div></div>`;
  }
  return '';
}

// Tooltips
chart.on('mousemove', params => {
  controller.tooltip.show({
      x: params.event.event.clientX,
      y: params.event.event.clientY,
      content: () => {
          return getMetricTooltip(params);
      }
  });
});

chart.on('mouseout', () => {
  controller.tooltip.hide();
});

// Menu bar
chart.on('click', params => {
  controller.tooltip.hide();
  controller.menu.show({
      x: params.event.event.clientX,
      y: params.event.event.clientY,
      data: () => params.data.datum,
  });
});
