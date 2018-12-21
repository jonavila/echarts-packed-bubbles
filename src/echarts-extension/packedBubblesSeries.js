import echarts from "echarts/lib/echarts";
import createListSimply from "echarts/lib/chart/helper/createListSimply";

echarts.extendSeriesModel({
  type: "series.packedBubbles",

  getInitialData: function(option, ecModel) {
    return createListSimply(this, ["value"]);
  },

  defaultOption: {
    zlevel: 0,
    z: 2,
    itemStyle: {
      borderWidth: 1
    },
    animationEasing: "cubicInOut",
  }
});
