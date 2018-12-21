import echarts from "echarts/lib/echarts";
import zrender from 'zrender';

const graphic = echarts.graphic;

const getFont = (size, family = 'source-sans-pro, sans-serif') => `400 ${size}px ${family}`;

const calculateFontSize = (data, idx, radius) => {
  const defaultFontSize = 12;
  const maxFontSize = 24;
  const zrenderCanvasContext = zrender.util.getContext();
  zrenderCanvasContext.font = getFont(12);
  const textWidth = zrenderCanvasContext.measureText(data.getName(idx)).width;
  let fontSize = Math.floor((((2 * radius) - 20) * defaultFontSize) / textWidth);
  if (fontSize > maxFontSize) fontSize = maxFontSize;
  else if (fontSize < 0) fontSize = 0;
  return fontSize;
};

function Bubble(data, idx) {
  graphic.Group.call(this);
  const circle = new graphic.Circle({
    z: 2
  });
  this.add(circle);
  this.updateData(data, idx, true);
  this.updateStyle(circle, data, idx);
}

const bubbleProto = Bubble.prototype;

const realSize = _.flow([calculateFontSize, getFont]);

bubbleProto.updateStyle = function(
  el,
  data,
  dataIndex
) {
  const color = data.getItemVisual(dataIndex, "color");
  const opacity = data.getItemVisual(dataIndex, "opacity");

  const rgb = echarts.color.parse(color);
  const luminosity = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  const textFill = luminosity >= 165 ? '#000' : '#FFF';

  el.setStyle({ fill: color, opacity: opacity, text: data.getName(dataIndex), textFill, 
                font: realSize(data, dataIndex, el.shape.r) });
};

bubbleProto.updateData = function(data, idx, firstCreate) {
  const circle = this.childAt(0);
  const seriesModel = data.hostModel;
  const layout = data.getItemLayout(idx);
  const circleShape = echarts.util.extend({}, layout);

  if (firstCreate) {
    circleShape["r"] = 0;
    circle.setShape(circleShape);
    graphic.initProps(
      circle,
      {
        shape: { r: layout.r },
      },
      seriesModel,
      idx
    );
  } else {
    graphic.updateProps(
      circle,
      {
        shape: circleShape,
      },
      seriesModel,
      idx
    );
  }
  // Animate manually the textBox
  const animator = circle.animators.pop();
  animator.during(function() {
    circle.setStyle({ font: realSize(data, idx, circle.shape.r) });
  });
  circle.animators.push(animator);
};

echarts.util.inherits(Bubble, graphic.Group);

echarts.extendChartView({
  type: "packedBubbles",

  init: function() {
    const circleGroup = new graphic.Group();
    this._circleGroup = circleGroup;
  },

  render: function(seriesModel, ecModel, api) {
    const data = seriesModel.getData();
    const oldData = this._data;
    const group = this.group;
    data
      .diff(oldData)
      .add(function(idx) {
        const bubble = new Bubble(data, idx);
        data.setItemGraphicEl(idx, bubble);
        group.add(bubble);
      })
      .update(function(newIdx, oldIdx) {
        const bubble = oldData.getItemGraphicEl(oldIdx);
        bubble.updateData(data, newIdx);
        group.add(bubble);
        data.setItemGraphicEl(newIdx, bubble);
      })
      .remove(function(idx) {
        const bubble = oldData.getItemGraphicEl(idx);
        group.remove(bubble);
      })
      .execute();

    this._data = data;
  },
});
