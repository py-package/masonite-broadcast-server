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

// Check if the user is running the app in the terminal
if (process.argv.length > 2) {

    program
        .version('0.0.1')
        .command('exec start')
        .description("Masonite Broadcast Server!")
        .option('-p, --port <n>', 'Port to listen on', "3000")
        .option('-h, --host <n>', 'Host to listen on', 'localhost')
        .option('-a, --auth <n>', 'Broadcast auth url', '/broadcasting/auth')
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
} else {
    new SocketChannel(httpServer, "http://localhost:8000//broadcasting/authorize");
    httpServer.listen(3000, () => {
        console.log(
            chalk.red(
                figlet.textSync('MBroadCast', { horizontalLayout: 'full' }),
                "dev listening on *:" + (3000)
            )
        );
    });
}