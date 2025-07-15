```js {pochoir}
const { today } = await template.import("pochoir:date");

template.exports.addCreated = (properties) => {
	properties.created = today();
};

template.exports.message = () => {
  return "Hello World";
};
```

```js {pochoir}
const { today } = await template.import("pochoir:date");
template.exports.zid = () => today("YYYYMMDDHHmm");
```
