import echarts from "echarts/lib/echarts";
const graphic = echarts.graphic;

function Bubble(data, idx) {
  graphic.Group.call(this);
  const itemModel = data.getItemModel(idx);
  const seriesModel = data.hostModel;
  const circle = new graphic.Circle({
    z2: 2
  });
  const text = new graphic.Text();
  this.add(circle);
  this.add(text);
  this.updateData(data, idx, true);
  this.updateStyle(circle, data, idx, itemModel, seriesModel);
}

const bubbleProto = Bubble.prototype;

bubbleProto.updateStyle = function(
  el,
  data,
  dataIndex,
  itemModel,
  seriesModel
) {
  const color = data.getItemVisual(dataIndex, "color");
  const opacity = data.getItemVisual(dataIndex, "opacity");
  const itemStyleModel = itemModel.getModel("itemStyle");

  el.useStyle({ fill: color, opacity: opacity });
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
        shape: { r: layout.r }
      },
      seriesModel,
      idx
    );
  } else {
    graphic.updateProps(
      circle,
      {
        shape: circleShape
      },
      seriesModel,
      idx
    );
  }
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

  dispose: function() {
    // dispose nothing here
  }
});
