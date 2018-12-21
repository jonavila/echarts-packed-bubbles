import { hierarchy, pack } from "d3-hierarchy";

export default function(seriesType, ecModel, api) {
  ecModel.eachSeriesByType(seriesType, function(seriesModel) {
    const data = seriesModel.getData();
    const root = hierarchy({
      children: seriesModel.get("data").map(d => ({
        key: d.name,
        children: [d]
      }))
    })
      .sum(d => d.value)
      .each(node => {
        if (node.depth === 1) {
          node.name = node.data.key;
          node.datum = node.children[0].data;
          delete node.children;
        }
      });

    pack()
      .size([api.getWidth() - 2, api.getHeight() - 2])
      .padding(1.5)(root);

    const enhancedData = root
      .descendants()
      .filter(node => node.data.key)
      .map(node => ({
        name: node.name,
        value: node.value,
        datum: node.datum,
        layout: {
          x: node.x,
          y: node.y,
          r: node.r
        }
      }));

    data.each([], idx => {
      const rawDataItem = data.getRawDataItem(idx);
      const enhancedNode = enhancedData.find(
        node => node.name === rawDataItem.name
      );

      if (enhancedNode) {
        data.setItemLayout(idx, {
          cx: enhancedNode.layout.x,
          cy: enhancedNode.layout.y,
          r: enhancedNode.layout.r
        });
      }
    });
  });
}
