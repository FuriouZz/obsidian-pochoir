```js {pochoir}
template.exports.addCreated = (properties) => {
	properties.created = pochoir.date.today();
};

template.exports.yolo = () => {
  return "yolo";
};
```
