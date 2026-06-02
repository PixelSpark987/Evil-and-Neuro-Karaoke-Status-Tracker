// ==UserScript==
// @name         Evil and Neuro Karaoke - Status Tracker
// @description  Mark Setlists as completed to avoid downloading the same one again.
// @author       PixelSpark987
// @namespace    http://tampermonkey.net/
// @icon         https://is.gd/NKTwins
// @version      2.2
// @match        *://evilkaraoke.com/*
// @match        *://neurokaraoke.com/*
// @match        *://twinskaraoke.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dim everything inside the card EXCEPT the button */
        .sl-complete-card > *:not(.sl-btn-universal) {
            opacity: 0.45 !important;
            filter: saturate(0.4) !important;
        }

        .sl-btn-universal {
            color: white !important;
            border: 1px solid rgba(255,255,255,0.4) !important;
            padding: 3px 8px !important;
            font-size: 10px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            z-index: 99 !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            /* Ensure button stays bright even if parent is dimmed */
            opacity: 1.0 !important;
            filter: saturate(1) brightness(1) !important;
        }

        .status-pending { background: #ff0066 !important; }
        .status-done { background: #00d9ff !important; }

        .sl-btn-list {
            position: absolute !important;
            bottom: 12px !important;
            right: 12px !important;
        }
    `;
    document.head.appendChild(style);

    function runTracker() {
        const isPlaylistPage = window.location.pathname.includes('/playlist/');
        const floatingBtn = document.querySelector('#page-toggle');

        if (!isPlaylistPage && floatingBtn) floatingBtn.remove();

        // --- PART A: MAIN LIST VIEW ---
        const cards = document.querySelectorAll('a[href*="/playlist/"]');
        cards.forEach(card => {
            const href = card.getAttribute('href');
            if (card.querySelector('.sl-btn-universal')) return;

            card.style.position = 'relative';

            const isDone = GM_getValue(href, false);
            if (isDone) card.classList.add('sl-complete-card');

            const btn = document.createElement('button');
            btn.className = `sl-btn-universal sl-btn-list ${isDone ? 'status-done' : 'status-pending'}`;
            btn.innerText = isDone ? '✓ COMPLETED' : 'PENDING';

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                GM_setValue(href, !isDone);
                location.reload();
            };

            card.appendChild(btn);
        });

        // --- PART B: INDIVIDUAL PLAYLIST PAGE ---
        if (isPlaylistPage && !floatingBtn) {
            const path = window.location.pathname;
            const isDone = GM_getValue(path, false);

            const pageBtn = document.createElement('button');
            pageBtn.id = 'page-toggle';
            pageBtn.className = `sl-btn-universal ${isDone ? 'status-done' : 'status-pending'}`;
            pageBtn.style.position = 'fixed';
            pageBtn.style.top = '70px';
            pageBtn.style.right = '10px';
            pageBtn.style.padding = '6px 12px';
            pageBtn.innerText = isDone ? '✓ COMPLETED' : 'MARK AS COMPLETE';

            pageBtn.onclick = () => {
                GM_setValue(path, !isDone);
                location.reload();
            };
            document.body.appendChild(pageBtn);
        }
    }

    setInterval(runTracker, 1500);
})();