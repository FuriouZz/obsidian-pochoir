---
hide_menu: false
order: 2
---
# Form Fields

A form accepts a variety of fields.

## Text field

```yaml
type: text # required
label: "" # optional
defaultValue: "" # optional
```

## Textarea field

```yaml
type: textarea # required
label: "" # optional
defaultValue: "" # optional
```

## Date field

```yaml
type: date # required
label: "" # optional
defaultValue: "" # optional
```

## Time field

```yaml
type: time # required
label: "" # optional
defaultValue: "" # optional
```

## Number field

```yaml
type: number # required
label: "" # optional
defaultValue: 0 # optional
min: 0 # optional
max: 1 # optional
step: 0.1 # optional
```

## Slider field

```yaml
type: slider # required
label: "" # optional
defaultValue: 0 # optional
min: 0 # optional
max: 5 # optional
step: 1 # optional
```

## Toggle field

```yaml
type: slider # required
label: "" # optional
defaultValue: false # optional
min: 0 # optional
max: 5 # optional
step: 1 # optional
```

## Dropdown field

```yaml
type: dropdown # required
label: "" # optional
defaultValue: "" # optional
options: # required
  key0: value0
  key1: value1
  key2: value2
```
