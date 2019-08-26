# :surfer: S

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/mystroken/s/issues)

> Custom scroll event with touch (works on <=iOS7) and keyboard compatible.<br>This is a fork of Bartek Drozdz VirtualScroll util. See his [article](http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/) for a complete description.

<br>

### :tada: Goals of the fork
- Easier to add in a CommonJS environment
- Enable to create several distinct instances by using a prototype rather than a singleton

<br>

## Installation

```bash
npm install @mystroken/s
```

## Usage & API

- `new S(options)`
Return a new instance of S. See the options below.

- `instance.on(fn)`
Listen to the scroll event using the specified function (fn).

- `instance.off(fn)`
Remove the listener.

- `instance.destroy()`
Will remove all events and unbind the DOM listeners.

## Options
- **el**: the target element for mobile touch events. *Defaults to window.*
- **mouseMultiplier**: General multiplier for all mousewheel (including Firefox). *Default to 1.*
- **touchMultiplier**: Mutiply the touch action by this modifier to make scroll faster than finger movement. *Defaults to 2.*
- **firefoxMultiplier**: Firefox on Windows needs a boost, since scrolling is very slow. *Defaults to 15.*
- **keyStep**: How many pixels to move with each key press. *Defaults to 120.*
- **preventTouch**: If true, automatically call e.preventDefault on touchMove. Defaults to false.
