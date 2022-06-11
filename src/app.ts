#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const program = require('commander');

import express, { Application } from 'express';
import { createServer, Server } from "http";

import SocketChannel from "./channels/socket-channel";

const app: Application = express();
const httpServer: Server = createServer(app);

new SocketChannel(httpServer, 'default');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/templates/index.html');
});

program
    .version('0.0.1')
    .command('exec start')
    .description("Masonite Broadcast Server!")
    .option('-p, --port <n>', 'Port to listen on', "3000")
    .option('-h, --host <n>', 'Host to listen on', 'localhost')
    .parse(process.argv);

const options = program.opts();

httpServer.listen(options.port ?? 3000, options.host ?? 'localhost', () => {
    console.log(
        chalk.red(
            figlet.textSync('MBroadCast', { horizontalLayout: 'full' }),
            "listening on *:" + (options.port ?? 3000)
        )
    );
});