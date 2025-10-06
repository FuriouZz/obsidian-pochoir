```pochoir-command
title: Insert template from clipboard
action: insert
trigger: editor-menu
template: clipboard()
```

Copy: {{date.today("YYYY-MM-DD")}}
Paste: 

```pochoir-command
title: Replace selection
action: insert
trigger: editor-menu
template: selection()
```

Select/Replace: {{date.today("YYYY-MM-DD")}}