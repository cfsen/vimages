# 0.1.6

## User facing:
- feature: support for  `ctrl+d`, `ctrl+j` cursor navigation.
- feature: leader overlay now dynamically populates from keybindings.
- ui: directory browser touchup.
- ui: image grid workspace no longer opens empty directories.
- ui: added ui feedback to several interactions.
- ui: two pane directory browser can be toggled with `:set parentpane`, and is disabled by default.

### Under the hood:
- pipeline for passing messages from backend.
- work on more extendable ui layout/workspace commenced.

---

# 0.1.5

## User facing:
- ui: widget added for displaying non-error messages.
- customization: custom keybind support by editing config file. 
- cache: cache info can be displayed with `:cache info` command.
- cache: cleanup routine for removing orphaned thumbnails can be run with `:cache clean` command.
- command mode: cursor and basic editing support added.
- command mode: command for changing directories updated from  `:e [path]` to `:cd [path]`

### Under the hood:
- keyboard module refactor.
- command handling refactor.
- cache journaling with sqlite.

---

# 0.1.4

- persistent app configs
- cursor position history
- leader key/menu
- improved dir browsing UX with left/right keybinds

- misc UX fixes
- first pass of wayland/hyprland compliance
