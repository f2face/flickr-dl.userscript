// ==UserScript==
// @name         Flickr Downloader
// @namespace    https://github.com/f2face/flickr-dl.userscript
// @version      0.2.1.2
// @description  A userscript for downloading Flickr photos.
// @author       f2face
// @match        https://www.flickr.com/*
// @grant        none
// @require      https://cdn.rawgit.com/uzairfarooq/arrive/v2.4.1/minified/arrive.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Flickr API endpoint
    var api_endpoint = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1';

    function addDownloadButton(element) {
        // Arrive
        document.arrive(element, function(){
            var el = this;
            var dlbar = createButton();
            var dlbtn = dlbar.getElementsByTagName('button')[0];
            var photo_url = window.location.href;
            var interaction_bar = el.getElementsByClassName('interaction-bar');
            if (interaction_bar.length > 0) {
                dlbar.style.position = 'absolute';
                dlbar.style.top = '-60px';
                dlbar.style.right = '10px';
                interaction_bar[0].appendChild(dlbar);
                photo_url = el.getElementsByClassName('overlay')[0].getAttribute('href');
            }
            else {
                dlbar.style.marginBottom = '10px';
                dlbar.style.paddingBottom = '10px';
                dlbar.style.borderBottom = '1px solid #cfd6d9';
                el.getElementsByClassName('sub-photo-right-view')[0].prepend(dlbar);
            }

            // OnClick event
            dlbtn.addEventListener('click', function(){
                var uri = photo_url;
                var regex_patt = /\/(\d+)\/?/gi;
                var photo_id = regex_patt.exec(uri)[1];
                var request_url = api_endpoint + '&api_key=' + getApiSiteKey() + '&photo_id=' + photo_id + '&csrf=' + getCsrfToken();
                dlbtn.disabled = true;
                ajaxSend(request_url, function(data){
                    data = JSON.parse(data);
                    download(data);
                    dlbtn.disabled = false;
                });
            });
        });

        // Leave
        document.leave(element, function(){
            document.unbindArrive(this);
        });
    }

    function createButton() {
        var dlbar = document.createElement('div');
        dlbar.className = 'tool';
        dlbar.innerHTML = '<button style="min-width:0; padding:0 10px; z-index:100000;" title="Download">Download</button>';
        return dlbar;
    }

    function getApiSiteKey() {
        return window.YUI_config.flickr.api.site_key;
    }

    function getCsrfToken() {
        return window.YUI_config.flickr.csrf.token;
    }

    function basename(path) {
        return path.split('/').slice(-1)[0];
    }

    function ajaxSend(url, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(this.responseText);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function prepareImgLink(link) {
        var img = link.split('.');
        return img.slice(0, -1).join('.') + '_d.' + img.slice(-1)[0];
    }

    function isFirefox() {
        return /Firefox\//i.test(navigator.userAgent);
    }

    function download(data) {
        if (!data.hasOwnProperty('sizes')) {
            var error_msg = 'An error occured. Please refresh the page.';
            alert(data.hasOwnProperty('message') ? error_msg+"\r\nError: "+data.message : error_msg);
            return false;
        }
        var largest_photo = data.sizes.size.slice(-1)[0];
        var img = prepareImgLink(largest_photo.source);
        var a = document.createElement('a');
        a.href = img;
        if (isFirefox())
            a.dispatchEvent(new MouseEvent('click'));
        else
            a.click();

        console.log(img);
    }

    // Add download button on photos grid
    addDownloadButton('.photo-list-photo-interaction');

    // Add download button on single photo page
    addDownloadButton('.photo-page-scrappy-view');
})();