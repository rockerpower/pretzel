const { app, BrowserWindow, ipcMain, Tray, remote } = require("electron");
const path = require("path");
const url = require("url");
const Positioner = require("electron-positioner");
const objc = require("objc");
const assetsDirectory = path.join(__dirname, "assets");

objc.import("AppKit");

app.dock.hide();

// called when Electron has finished initialization and is ready to create browser windows.
app.on("ready", () => {
  const tray = new Tray(path.join(assetsDirectory, "shortcuts@2x.png"));
  const win = new BrowserWindow({
    width: 800, //250,
    height: 300,
    frame: false,
    resizable: false,
    movable: false,
    show: false
  });
  const positioner = new Positioner(win);
  const trayBounds = tray.getBounds();
  const winPosition = positioner.calculate("trayCenter", trayBounds);

  win.setPosition(winPosition.x, winPosition.y);

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  tray.on("click", function(event) {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  win.on("show", () => {
    const { NSWorkspace, js } = objc;
    let currentAppProxy = NSWorkspace.sharedWorkspace()
      .frontmostApplication()
      .localizedName();
    let currentApp = js(currentAppProxy);

    win.webContents.send("currentApp", currentApp);
    win.openDevTools();
  });

  win.on("hide", () => {
    tray.setHighlightMode("never");
  });

  win.on("blur", () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide;
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});