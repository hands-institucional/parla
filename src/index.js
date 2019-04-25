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

    vid.width = window.screen.width;
    vid.height = window.screen.height;
    overlay.width = window.screen.width;
    overlay.height = window.screen.height;
    webgl_overlay.width = window.screen.width;
    webgl_overlay.height = window.screen.height;
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

    // canvas for copying videoframes to
    var videocanvas = document.createElement('CANVAS');
    videocanvas.width = vid_width;
    videocanvas.height = vid_height;

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

    function gumSuccess( stream ) {
        
        // add camera stream if getUserMedia succeeded
        if ("srcObject" in vid) {
            vid.srcObject = stream;
        } else {
            vid.src = (window.URL && window.URL.createObjectURL(stream));
        }

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
    }

    function gumFail() {

        // fall back to video if getUserMedia failed
        insertAltVideo(vid);
        document.getElementById('gum').className = "hide";
        document.getElementById('nogum').className = "nohide";
        alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
    }

    MediaDevices.getUserMedia = MediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
    
    // set up video
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({
            video: {
                width: 320,
                height: 640,
                facingMode: "environment"
            }
        }).then(gumSuccess).catch(gumFail);
    } else if (MediaDevices.getUserMedia) {
        MediaDevices.getUserMedia({video : true}, gumSuccess, gumFail);
    } else {
        insertAltVideo(vid);
        document.getElementById('gum').className = "hide";
        document.getElementById('nogum').className = "nohide";
        alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
    }
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
        // get position of face
        positions = ctrack.getCurrentPosition();
        overlayCC.clearRect(0, 0, vid_width, vid_height);
        if (positions) {
            // draw current grid
            ctrack.draw(overlay);
        }
        // check whether mask has converged
        var pn = ctrack.getConvergence();
        if (pn < 0.4) {
            drawMaskLoop();
        } else {
            window.requestAnimationFrame(drawGridLoop);
        }
    }

    function drawMaskLoop() {
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
                curValA += 4;
            } else {
                curValA -= 4;
            }
            
            if(curValA <= minValA && dirA == false) {
                dirA = true
            }

            if(curValA >= maxValA && dirA == true) {
                dirA = false
            }
            
            parameters[6] = curValA;

            if(dirB == true){
                curValB += 4;
            } else {
                curValB -= 4;
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

        animationRequest = window.requestAnimationFrame(drawMaskLoop);
    }

}
