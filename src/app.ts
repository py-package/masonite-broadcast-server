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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/templates/index.html');
});

let host = '127.0.0.1';
let port = 3000;
let authUrl = 'http://localhost:8000/broadcasting/auth';

try {
    program
        .version('0.0.1')
        // .command('exec start')
        .description("Masonite Broadcast Server!")
        .option('-p, --port <n>', 'Port to listen on', "3000")
        .option('-h, --host <n>', 'Host to listen on', 'localhost')
        .option('-a, --auth <n>', 'Broadcast auth url', 'http://localhost:8000/broadcasting/auth')
        .parse(process.argv);

    const options = program.opts();
    host = options.host;
    port = options.port;
    authUrl = options.auth;
} finally {
    new SocketChannel(httpServer, authUrl);
    httpServer.listen(port, host, () => {
        console.log(
            chalk.red(
                figlet.textSync('MBroadCast', { horizontalLayout: 'full' }),
                "listening on *:" + (port)
            )
        );
    });
}