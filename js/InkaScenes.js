var gl;

var InkaScenes = function (opts) {
    opts = opts || {};

    this.clock = 20;

    this.scenes = {};

    if (opts.canvas) {
        this.canvas = opts.canvas;
    } else if (opts.canvasId) {
        this.canvas = document.getElementById(opts.canvasId);
    } else {
        this.canvas = document.createElement('canvas');
    }

    this.jobs = opts.jobs || 128;

    this._start();
};

InkaScenes.prototype.addScene = function (name) {
    this.scenes[name] = new InkaModel(name, this.group);
    this.scenes[name].parent = this;

    if (!this.sceneForCamera) {
        this.useCamera(name);
    }

    return this.scenes[name];
};

InkaScenes.prototype.useCamera = function (name, shapeName) {
    this.sceneForCamera = name;

    if (shapeName) {
        this.scenes[name].useCameraShape(shapeName);
    }
};

InkaScenes.prototype.cameraMatrix = function (name, shapeName) {
    var scene = this.scenes[name];

    if (!scene) {
        return false;
    }

    return scene.cameraMatrix(shapeName);
};

InkaScenes.prototype.tick = function () {
    var self = this,
        running = this.drawScene();

    var motionsCount = 0;
    for (var i in this.scenes) {
        motionsCount += this.scenes[i].motions.length;
    }

    if (motionsCount === 0) {
        this.ticker = null;
        return;
    }

    this.ticker = setTimeout(function () {
        self.tick();
    }, this.clock);
};

InkaScenes.prototype.startTicker = function () {
    if (this.ticker) {
        return;
    }
    this.tick();
};

InkaScenes.prototype._start = function () {
    var self = this;

    // get webgl context
    gl = WebGLUtils.setupWebGL(this.canvas);

    // set resize handler
    window.addEventListener('resize', function () {
        self.resize();
    }, false);
    this.resize();

    // create view and projection matrix
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);

    // create renderer with given number of pre-allocated render jobs
    this.renderer = digi.createRenderer(this.jobs);

    // create a render group
    this.group = this.renderer.createGroup();

    // init gl
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);

    this.tick();
};

InkaScenes.prototype.resize = function () {
    var canvas = this.canvas,
        w = canvas.offsetWidth,
        h = canvas.offsetHeight;

    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);

    this.aspect = w / h;
};

InkaScenes.prototype.drawScene = function () {
    this.update();
    this.render();
};

InkaScenes.prototype.update = function () {
    var scenes = this.scenes,
        group = this.group,
        viewMatrix = this.viewMatrix,
        projectionMatrix = this.projectionMatrix;

    // get time
    var time = new Date().getTime();

    if (!this.sceneForCamera || !this.scenes[this.sceneForCamera].sceneCameraMatrix) {
        return;
    }

    // set time
    for (var name in scenes) {
        scenes[name].drawScene(time);
    }

    group.update();

    // sceneForCameraのカメラ・プロジェクションを使用
    digi.matrix4x4Inv(
        this.scenes[this.sceneForCamera].sceneCameraMatrix,
        viewMatrix
    );
    digi.matrix4x4Projection(
        this.scenes[this.sceneForCamera].sceneProjection,
        this.aspect, projectionMatrix
    );
};

InkaScenes.prototype.rotateX = function (angle) {
    this._angleX = angle;
};

InkaScenes.prototype.getRotateXMatrix = (function () {
    
    var m = new Matrix4();
    var mat = m.identity(m.create());
    var axis = new Vector4(1, 0, 0, 0);
    var translateFilter = new Vector4(0, 0, 0, 1);

    return function () {
        mat = m.identity(m.create());
        var translateMatrix1 = m.identity(m.create());
        var translateMatrix2 = m.identity(m.create());
        var rotateMatrix     = m.identity(m.create());
        var local_axis       = axis.applyMatrix4(this.viewMatrix);
        var translateVector  = translateFilter.applyMatrix4(this.viewMatrix);

        m.translate(translateMatrix2, translateVector, translateMatrix2);
        translateVector.multiplyScalar(-1);
        m.translate(translateMatrix1, translateVector, translateMatrix1);
        m.rotate(rotateMatrix, this._angleX || 0, local_axis, rotateMatrix);
        m.multiply(translateMatrix1, rotateMatrix, mat);
        m.multiply(mat, translateMatrix2, mat);

        return mat;
    };
}());

InkaScenes.prototype.rotateY = function (angle) {
    this._angleY = angle;
};

InkaScenes.prototype.getRotateYMatrix = (function () {
    
    var m = new Matrix4();
    var mat = m.identity(m.create());
    var axis = new Vector4(0, 1, 0, 0);
    var translateFilter = new Vector4(0, 0, 0, 1);

    return function () {
        mat = m.identity(m.create());
        var translateMatrix1 = m.identity(m.create());
        var translateMatrix2 = m.identity(m.create());
        var rotateMatrix     = m.identity(m.create());
        var local_axis       = axis.applyMatrix4(this.viewMatrix);
        var translateVector  = translateFilter.applyMatrix4(this.viewMatrix);

        m.translate(translateMatrix2, translateVector, translateMatrix2);
        translateVector.multiplyScalar(-1);
        m.translate(translateMatrix1, translateVector, translateMatrix1);
        m.rotate(rotateMatrix, this._angleY || 0, local_axis, rotateMatrix);
        m.multiply(translateMatrix1, rotateMatrix, mat);
        m.multiply(mat, translateMatrix2, mat);

        return mat;
    };
}());

InkaScenes.prototype.translate = (function () {

    var m = new Matrix4(),
        mat = m.identity(m.create()),
        z_axis = new Vector3(0, 0, 1);

    return function (v) {
        var tmp = m.identity(m.create()),
            viewMatrix = this.viewMatrix;

        var local = z_axis.applyMatrix4withoutW(viewMatrix).normalize();
        local.multiplyScalar(v.z);

        this._translateMatrix = m.translate(tmp, local, mat);
    };
}());

InkaScenes.prototype.render = (function () {

    var m = new Matrix4();

    return function () {

        var group = this.group,
            viewMatrix = this.viewMatrix,
            projectionMatrix = this.projectionMatrix;

        var mat = null;

        for (var i = 0, l = viewMatrix.length; i < l; i++) {
            if (viewMatrix[i] !== 0) {
                mat = m.identity(m.create());
                m.multiply(viewMatrix, this.getRotateYMatrix(), mat);
                m.multiply(mat, this.getRotateXMatrix(), mat);
            }
        }

        if (this._translateMatrix) {
            m.multiply(viewMatrix, this._translateMatrix, viewMatrix);
        }

        // render scene
        // clear back buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // render the group using render layer 'color'
        group.render(mat || viewMatrix, projectionMatrix, 'color');
    };
}());
