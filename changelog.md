# 0.1.7

## User facing:
- feature: full screen image viewing improvements, see: 2b0da26 and 0af76fa
- feature: title bar can be toggled with `:set titlebar`
- feature: info widget can be made persistent with `:set infowindow`
- ui: scrollbar now hides after a few seconds in full screen image view.
- ui: when command mode is active, command line is now visible in full screen image view.
- ui: no longer uses full resolution images as placeholders if no thumbnails can be found.
- ui: help overlay can now be displayed on top of full screen images.

### Under the hood:
- loading keybindings from config will use defaults, if it fails match the exact number of expected binds.
- fixes for cursor navigation in grid view.
- support for special characters in image file names.
- basic safeguards for thumbnail queue duplication.
- removed reference to uncommitted debug code in lib.rs.

---

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
