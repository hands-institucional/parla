window.onload = function() {
    
    if (window.location.protocol == "file:") {
        alert("You seem to be running this example directly from a file. Note that these examples only work when served from a server or localhost due to canvas cross-domain restrictions.");
    } else if (window.location.hostname !== "localhost" && window.location.protocol !== "https:"){
        window.location.protocol = "https";
    }

    var vid = document.getElementById('videoel');
    var overlay = document.getElementById('overlay');
    var webgl_overlay = document.getElementById('webgl');
    var overlayCC = overlay.getContext('2d');
    var videoSelect = document.querySelector("select#videoSource");
    var audio = document.querySelector('#audioel');
    var button = document.querySelector('#parla');
    var selectors = [videoSelect];
    var speaking = false;
    var isPlaying = false;

    var calculatedHeight;

    if(window.screen.height > window.screen.width) {
        calculatedHeight = window.screen.width - (window.screen.height - window.innerHeight);
    } else calculatedHeight = window.innerHeight;

    vid.width = window.screen.width;
    vid.height = calculatedHeight;
    overlay.width = window.screen.width;
    overlay.height = vid.height;
    webgl_overlay.width = window.screen.width;
    webgl_overlay.height = vid.height;
    var vid_width = vid.width;
    var vid_height = vid.height;
    var dirA = true;
    var minValA = -9;
    var maxValA = 5;
    var curValA = -9;

    var dirB = false;
    var minValB = -5;
    var maxValB = 10;
    var curValB = 10;

    var fps, fpsInterval, startTime, now, then, elapsed;

    // canvas for copying videoframes to
    var videocanvas = document.createElement('CANVAS');
    videocanvas.width = vid_width;
    videocanvas.height = vid_height;

    button.addEventListener('click', parlare);
    window.addEventListener('resize', adjustVideoProportions);

    /*********** Setup of video/webcam and checking for webGL support *********/
    function enablestart() {
        startVideo()
    }

    // check whether browser supports webGL
    var webGLContext;

    if (window.WebGLRenderingContext || window.WebGL2RenderingContext) {
        webGLContext = webgl_overlay.getContext('webgl') || webgl_overlay.getContext('experimental-webgl');
        if (!webGLContext) {
            webGLContext = null;
        }
    }

    if (webGLContext == null) {
        alert("Your browser does not seem to support WebGL. Unfortunately this face mask example depends on WebGL, so you'll have to try it in another browser. :(");
    }

    'use strict';

    function gotDevices(deviceInfos) {
        // Handles being called several times to update labels. Preserve values.
        const values = selectors.map(select => select.value);
        selectors.forEach(select => {
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
        });

        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            const option = document.createElement('option');
            option.value = deviceInfo.deviceId;

            if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
            }
        }

        selectors.forEach((select, selectorIndex) => {
            if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
                select.value = values[selectorIndex];
            }
        });
    }

    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        vid.srcObject = stream;
        // Refresh button list in case labels have become available

        vid.onloadedmetadata = function() {
            adjustVideoProportions();
            fd.init(webgl_overlay);
            vid.play();
        }

        vid.onresize = function() {
            adjustVideoProportions();
            if (trackingStarted) {
                ctrack.stop();
                ctrack.reset();
                ctrack.start(vid);
            }
        }

        return navigator.mediaDevices.enumerateDevices();
    }

    function handleError(error) {
        console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    }

    function adjustVideoProportions() {

        // resize overlay and video if proportions of video are not 4:3
        // keep same height, just change width
        var proportion = vid.videoWidth/vid.videoHeight;
        vid_width = Math.round(vid_height * proportion);
        vid.width = vid_width;
        overlay.width = vid_width;
        webgl_overlay.width = vid_width;
        videocanvas.width = vid_width;
        webGLContext.viewport(0,0,webGLContext.canvas.width,webGLContext.canvas.height);

    }

    MediaDevices.getUserMedia = MediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
    
    function start(param) {
        if (window.stream) {
            window.stream.getTracks().forEach(track => {
                track.stop();
            });
        }

        const videoSource = videoSelect.value;
        const constraints = {
            video: {
                width: window.screen.width,
                height: window.screen.height,
                deviceId: videoSource ? {exact: videoSource} : undefined
            }
        };
        if (param === 'default') {
            navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).then(changeDefault).catch(handleError);
        } else {
            navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
        }
    }

    function changeDefault() {

        if (window.stream) {
            window.stream.getTracks().forEach(track => {
                track.stop();
            });
        }

        videoSelect.value = videoSelect.lastChild
        const videoSource = videoSelect.lastChild.value;
        const constraints = {
            video: {
                width: window.screen.width,
                height: window.screen.height,
                deviceId: {exact: videoSource}
            }
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
    }

    videoSelect.onchange = start;
    start('default');

    vid.addEventListener('canplay', enablestart, false);
    
    var ctrack = new clm.tracker();
    ctrack.init(pModel);
    var trackingStarted = false;

    function startVideo() {
        vid.play();
        ctrack.start(vid);
        trackingStarted = true;
        drawGridLoop();
    }

    var fd = new faceDeformer();

    var mouth_vertices = [
        [44,45,61,44],
        [45,46,61,45],
        [46,60,61,46],
        [46,47,60,46],
        [47,48,60,47],
        [48,59,60,48],
        [48,49,59,48],
        [49,50,59,49],
        [50,51,58,50],
        [51,52,58,51],
        [52,57,58,52],
        [52,53,57,52],
        [53,54,57,53],
        [54,56,57,54],
        [54,55,56,54],
        [55,44,56,55],
        [44,61,56,44],
        [61,60,56,61],
        [56,57,60,56],
        [57,59,60,57],
        [57,58,59,57],
        [50,58,59,50],
    ];
    var extendVertices = [
        [0,71,72,0],
        [0,72,1,0],
        [1,72,73,1],
        [1,73,2,1],
        [2,73,74,2],
        [2,74,3,2],
        [3,74,75,3],
        [3,75,4,3],
        [4,75,76,4],
        [4,76,5,4],
        [5,76,77,5],
        [5,77,6,5],
        [6,77,78,6],
        [6,78,7,6],
        [7,78,79,7],
        [7,79,8,7],
        [8,79,80,8],
        [8,80,9,8],
        [9,80,81,9],
        [9,81,10,9],
        [10,81,82,10],
        [10,82,11,10],
        [11,82,83,11],
        [11,83,12,11],
        [12,83,84,12],
        [12,84,13,12],
        [13,84,85,13],
        [13,85,14,13],
        [14,85,86,14],
        [14,86,15,14],
        [15,86,87,15],
        [15,87,16,15],
        [16,87,88,16],
        [16,88,17,16],
        [17,88,89,17],
        [17,89,18,17],
        [18,89,93,18],
        [18,93,22,18],
        [22,93,21,22],
        [93,92,21,93],
        [21,92,20,21],
        [92,91,20,92],
        [20,91,19,20],
        [91,90,19,91],
        [19,90,71,19],
        [19,71,0,19]
    ]

    function drawGridLoop() {

        var frameId = requestAnimationFrame(drawGridLoop);
        now = Date.now();
        elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
        }
        
        positions = ctrack.getCurrentPosition();
        overlayCC.clearRect(0, 0, vid_width, vid_height);
        if (positions) {
            ctrack.draw(overlay);
        }

        var pn = ctrack.getConvergence();
        if (pn < 20000) {
            enableParla();
        } else {
            disableParla();
        }

    }

    function enableParla() {
        button.disabled = false;
    }

    function disableParla() {
        button.disabled = true;
    }

    function parlare() {
        if(!speaking) {
            speaking = true;
            drawMaskLoop();
        }
    }

    function drawMaskLoop() {

        var frameId = requestAnimationFrame(drawMaskLoop);
        now = Date.now();
        elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
        }

        videocanvas.getContext('2d').drawImage(vid,0,0,videocanvas.width,videocanvas.height);
        var pos = ctrack.getCurrentPosition();
        if (pos) {
            // create additional points around face
            var tempPos;
            var addPos = [];
            for (var i = 0;i < 23;i++) {
                tempPos = [];
                tempPos[0] = (pos[i][0] - pos[62][0])*1.3 + pos[62][0];
                tempPos[1] = (pos[i][1] - pos[62][1])*1.3 + pos[62][1];
                addPos.push(tempPos);
            }
            // merge with pos
            var newPos = pos.concat(addPos);
            var newVertices = pModel.path.vertices.concat(mouth_vertices);
            // merge with newVertices
            newVertices = newVertices.concat(extendVertices);
            fd.load(videocanvas, newPos, pModel, newVertices);
            var parameters = ctrack.getCurrentParameters();

            if(dirA == true){
                curValA += 8;
            } else {
                curValA -= 8;
            }
            
            if(curValA <= minValA && dirA == false) {
                dirA = true
            }

            if(curValA >= maxValA && dirA == true) {
                dirA = false
            }
            
            parameters[6] = curValA;

            if(dirB == true){
                curValB += 2;
            } else {
                curValB -= 2;
            }
            
            if(curValB <= minValB && dirB == false) {
                dirB = true
            }

            if(curValB >= maxValB && dirB == true) {
                dirB = false
            }

            parameters[7] = curValB;

            // for (var i = 6;i < parameters.length;i++) {
            //     parameters[i] += ph['component '+(i-3)];
            // }
            positions = ctrack.calculatePositions(parameters);
            overlayCC.clearRect(0, 0, vid_width, vid_height);
            if (positions) {
                // add positions from extended boundary, unmodified
                newPos = positions.concat(addPos);
                // draw mask on top of face
                fd.draw(newPos);
            }
        }
        var pn = ctrack.getConvergence();

        if(pn < 99999 && audio.currentTime < audio.duration) {
            animationRequest = window.requestAnimationFrame(drawMaskLoop);
            if(!isPlaying) {
                audio.play();
            }
        } else {
            var webCTX = webgl_overlay.getContext('webgl');
            webCTX.clear(webCTX.COLOR_BUFFER_BIT);
            window.cancelAnimationFrame(animationRequest);
            window.requestAnimationFrame(drawGridLoop);
            speaking = false;
            audio.pause();
            audio.currentTime = 0;
        }

        window.cancelAnimationFrame(frameId);
    }

}
