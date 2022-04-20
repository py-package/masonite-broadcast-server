#! /usr/bin/env node

/**
 * Masonite Broadcast Server
 *
 * This file starts the socket.io server and loads configuration from a
 * broadcast-server.json file if available.
 *
 */
var MasoniteBroadcastServerCli = require('../dist/cli');

process.title = 'masonite-broadcast-server';