import echarts from "echarts/lib/echarts";
import dataColor from "echarts/lib/visual/dataColor";
import packedBubblesLayout from "./packedBubblesLayout";
import "./packedBubblesSeries";
import "./packedBubblesView";

echarts.registerVisual(dataColor("packedBubbles"));
echarts.registerLayout(
  echarts.util.curry(packedBubblesLayout, "packedBubbles")
);
