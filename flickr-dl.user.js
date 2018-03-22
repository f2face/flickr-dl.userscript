// ==UserScript==
// @name         Flickr Downloader
// @namespace    https://github.com/f2face/flickr-dl.userscript
// @version      0.1
// @description  A userscript for downloading Flickr photos.
// @author       f2face
// @match        https://www.flickr.com/*
// @grant        none
// @require      https://cdn.rawgit.com/uzairfarooq/arrive/2a6ccfc7/minified/arrive.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Flickr API key
    var api_key = window.YUI_config.flickr.api.site_key;

    // Flickr API endpoint
    var api_endpoint = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1';

    function addDownloadButton(element) {
        // Arrive
        document.arrive(element, function(){
            var el = this;
            var dlbar = document.createElement('div');
            dlbar.style.position = 'absolute';
            dlbar.style.top = '-60px';
            dlbar.style.right = '10px';
            dlbar.className = 'tool';
            dlbar.innerHTML = '<button style="min-width:0; padding:0 10px;" title="Download">Download</button>';

            el.getElementsByClassName('interaction-bar')[0].appendChild(dlbar);

            var dlbtn = dlbar.getElementsByTagName('button')[0];

            // OnClick event
            dlbtn.addEventListener('click', function(){
                var uri = el.getElementsByClassName('overlay')[0].getAttribute('href');
                var regex_patt = /\/(\d+)\//gi;
                var photo_id = regex_patt.exec(uri)[1];
                var request_url = api_endpoint + '&api_key=' + api_key + '&photo_id=' + photo_id + '&csrf=' + window.YUI_config.flickr.csrf.token;
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

    function basename(path) {
        return path.split('/').reverse()[0];
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

    addDownloadButton('.photo-list-photo-interaction');
})();