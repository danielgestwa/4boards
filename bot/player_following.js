// ==UserScript==
// @name         Player Following
// @namespace    http://tampermonkey.net/
// @version      2026-01-08
// @description  Saving chess.com games live to local database
// @author       Daniel Gęstwa
// @match        https://www.chess.com/member/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chess.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function docReady(fn) {
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 1000);
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

    function getPlayerName() {
        const url = window.location.href
        let urlArr = url.split("/")
        return urlArr.pop()
    }

    function openGameInNewTab(button) {
        window.open(button.href,'_blank');
    }

    function addPlayerToCookie(button) {
        let playersCookie = getCookie('players')
        if(!playersCookie) {
            playersCookie = '[]'
        }

        if(!playersCookie.includes(getPlayerName())) {
            let players = JSON.parse(playersCookie)
            players.push(getPlayerName())
            setCookie('players', JSON.stringify(players))
            openGameInNewTab(button)
        }
    }

    docReady(() => {
        setTimeout(() => {
            const buttons = document.getElementsByClassName('cc-button-component')
            for(const button of buttons) {
                if(button.textContent.includes("Oglądaj") && button.getAttribute("href") && button.getAttribute("href").includes("/game/")) {
                    addPlayerToCookie(button);
                    break;
                }
            }

            window.location.reload();
        }, 10000)
    });
})();