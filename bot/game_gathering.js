// ==UserScript==
// @name         Game Gathering
// @namespace    http://tampermonkey.net/
// @version      2025-12-28
// @description  Saving chess.com games live to local database
// @author       Daniel Gęstwa
// @match        https://www.chess.com/game/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chess.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const pieces_types = [
        'wP', 'wR', 'wN', 'wB', 'wK', 'wQ',
        'bP', 'bR', 'bN', 'bB', 'bK', 'bQ'
    ];

    let previousBoard = '';

    function docReady(fn) {
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 5*1000);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setCookie(cname, cvalue) {
        const d = new Date();
        d.setTime(d.getTime() + (1*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null
    }

    function getBoard() {
        const board = document.getElementsByTagName("wc-chess-board")[0].children;
        let pieces = {};
        for (let element of board) {
            if(element.classList.contains("piece")) {
                let type = null;
                pieces_types.forEach((el) => {
                    if(element.classList.contains(el.toLowerCase())) {
                        type = el;
                        return;
                    }
                });

                let pos = null;
                for(let className of element.classList) {
                    if(className.includes("square")) {
                        const numPos = className.split("-")[1];
                        pos = String.fromCharCode(96 + parseInt(numPos[0])) + numPos[1];
                        break;
                    }
                }

                pieces[pos] = type;
            }
        }
        return JSON.stringify(pieces)
    }

    function getText(className) {
        const elHTML = document.getElementsByClassName(className)[0];

        if(elHTML == undefined) {
            return null
        }

        const text = elHTML.textContent.trim().replace(/\s\s+/g, ' ');
        let textArr = text.split(" ");
        const last = textArr.pop()
        const first = textArr.join(" ")
        return { info: first, last: last, all: text }
    }

    function getWhite() {
        const data = getText("player-bottom")
        return { name: data.info, time: data.last }
    }

    function getBlack() {
        const data = getText("player-top")
        return { name: data.info, time: data.last }
    }

    function getResult() {
        const data = getText("header-title-component")
        if(!data) {
            return "Playing..."
        }
        else if(data.all.toLowerCase().includes("biał")) {
            return "White Won"
        }
        return "Black Won"
    }

    function getGameNumber() {
        const url = window.location.href
        let urlArr = url.split("/")
        return urlArr.pop()
    }

    function sendDataJSON(json) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:8000/games', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(json);
    }

    docReady(() => {
        setInterval(() => {
            const white = getWhite()
            const black = getBlack()
            const payload = JSON.stringify({
                game_number: getGameNumber(),
                white: white.name,
                black: black.name,
                time_white: white.time,
                time_black: black.time,
                board: getBoard(),
                result: getResult()
            })
            if(payload != previousBoard) {
                console.log(payload)
                sendDataJSON(payload);
                previousBoard = payload;
            }

            if(getResult() !== 'Playing...') {
                setTimeout(() => {
                    const playersCookie = getCookie('players');
                    if(!playersCookie) {
                        window.location.reload();
                    }

                    let players = JSON.parse(playersCookie)
                    const player = players.pop();
                    setCookie('players', JSON.stringify(players))
                    close();
                }, 1000)
            }
        }, 100);
    });
})();