# ampbar
> A modern, clickable status bar.

## About
### Motivation
I was looking for a good status bar to use with i3 and wasn't satisfied.

### Features
- Easy to set up and configure
- Block based components like i3blocks
- Powerful styling with CSS-like properties
- Extensibility through a simple ini-based configuration format
- Support for multiple instances with different config files
- Live reload on configuration change
- Support for custom css themes
- Builtin themes (Simple, Round, Flat, Flat-Adapt)

### Upcoming Features
- Option to completely override block styling with custom css

## Installation

Dependencies: realdir, nodeJS 8, npm

```bash
git clone https://github.com/SplittyDev/ampbar.git
cd ampbar
nvm use # if you're using nvm
make
sudo make install
```

Ampbar will place a script at /usr/sbin/ampbar to run itself.

## License

MIT © [Marco Quinten](https://github.com/splittydev)
