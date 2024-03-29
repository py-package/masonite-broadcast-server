# Masonite Broadcast Server

<p align="center">
    <img src="https://banners.beyondco.de/Masonite%20Broadcast%20Server.png?theme=light&packageManager=npm+install+-g&packageName=masonite-broadcast-server&pattern=charlieBrown&style=style_2&description=Broadcast+server+for+masonite+framework.&md=1&showWatermark=1&fontSize=100px&images=adjustments&widths=50&heights=50">
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/npm/v/masonite-broadcast-server">
  <img alt="issues" src="https://img.shields.io/github/issues/yubarajshrestha/masonite-broadcast-server">
  <img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/yubarajshrestha/masonite-broadcast-server">
  <img alt="License" src="https://img.shields.io/github/license/yubarajshrestha/masonite-broadcast-server">
  <a href="https://github.com/yubarajshrestha/masonite-permission/stargazers"><img alt="star" src="https://img.shields.io/github/stars/yubarajshrestha/masonite-broadcast-server" /></a>
  <img alt="downloads" src="https://img.shields.io/npm/dm/masonite-broadcast-server" />
</p>

## Introduction (WIP)

Broadcast server for masonite framework. It is a simple server that can be used to broadcast messages to all connected clients using socket-io.

**Masonite Broadcast Server and Client Library**
- [x] [Broadcast Driver - Backend](https://github.com/py-package/masonite-socketio-driver)
- [x] [Broadcast Client](https://github.com/yubarajshrestha/masonite-broadcast-client)

### Getting Started

Install the package using yarn or npm:

```sh
$ yarn add masonite-broadcast-server -g
$ npm install masonite-broadcast-server -g
```

### Start the Server

You can start the server using the following command:

```sh
$ mbroadcast start
$ mboradcast start --port=3000 --host=127.0.0.1 --auth=http://localhost:8000/broadcasting/auth
```

<img src="running.png" />


### Contribution
Because of tricky time and stuff I am not able to complete this library yet, but I am working on it. I will update the features and fix bugs as soon as I get time. If you can help me complete this library, please send me a pull request.
