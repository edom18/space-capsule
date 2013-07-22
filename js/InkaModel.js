var InkaModel = function (name, group) {
    this.name = name;
    this.sceneData = window[name];

    this.defaultCameraShape = 'cameraShape1';
    //this.defaultCameraShape = 'OpCameraShape';
    this.group = group;
    this.motions = [];
    this.sceneData.init();
    this.waitLoad();
};

InkaModel.prototype.initAccessor = function () {
    var self = this,
        infos = this.sceneData.scenes[this.name].parameterInfos,
        scene = this.scene;

    if (infos.time) {
        self._time = scene.getFloatVector('time');
        self.time = function (value) {
            self._time[0] = value;
        };
    }

    for (var i in infos) {
        (function (param) {
            if (param.indexOf('.') < 0) {
                return;
            }

            var parts = param.split('.', 2),
                objName = parts[0],
                methodName = parts[1];

            if (self[objName]) {
                return;
            }

            self[objName] = {};

            if (infos[objName + '.translate']) {
                self[objName]._translate = scene.getFloatVector(objName + '.translate');

                self[objName].translate = function () {
                    self[objName]._translate[0] = arguments[0];
                    self[objName]._translate[1] = arguments[1];
                    self[objName]._translate[2] = arguments[2];
                };
                self[objName].translateX = function (value) {
                    self[objName]._translate[0] = value;
                };
                self[objName].translateY = function (value) {
                    self[objName]._translate[1] = value;
                };
                self[objName].translateZ = function (value) {
                    self[objName]._translate[2] = value;
                };
            }
            if (infos[objName + '.rotate']) {
                self[objName]._rotate = scene.getFloatVector(objName + '.rotate');

                self[objName].rotate = function () {
                    self[objName]._rotate[0] = arguments[0];
                    self[objName]._rotate[1] = arguments[1];
                    self[objName]._rotate[2] = arguments[2];
                };
                self[objName].rotateX = function (value) {
                    self[objName]._rotate[0] = value;
                };
                self[objName].rotateY = function (value) {
                    self[objName]._rotate[1] = value;
                };
                self[objName].rotateZ = function (value) {
                    self[objName]._rotate[2] = value;
                };
            }
        })(i);
    }
};

InkaModel.prototype.waitLoad = function () {
    var self = this,
        sceneData = this.sceneData,
        progress = (this.sceneData.numLoaded + 0.5) / this.sceneData.numResources;

    if (progress < 1) {
        // continue waiting...
        requestAnimFrame(function () {
            self.waitLoad();
        });
    } else {
        // loading finished

        // create scene
        this.scene = this.sceneData.createScene(this.name, this.group);

        this.useCameraShape(this.defaultCameraShape);

        this.initAccessor();
    }
};

InkaModel.prototype.useCameraShape = function (shapeName) {
    shapeName = shapeName || this.defaultCameraShape;

    this.sceneCameraMatrix = this.scene.getFloatVector(shapeName + '.worldMatrix[0]', 16);
    this.sceneProjection = this.scene.getFloatArray(shapeName + '.projection');
};

InkaModel.prototype.cameraMatrix = function (shapeName) {
    shapeName = shapeName || this.defaultCameraShape;
    return this.scene.getFloatVector(shapeName + '.worldMatrix[0]', 16);
};

InkaModel.prototype.sceneProjection = function (shapeName) {
    shapeName = shapeName || this.defaultCameraShape;
    return this.scene.getFloatVector(shapeName + '.projection');
};

InkaModel.prototype.drawScene = function (t) {
    var self = this;

    if (!this.scene || !this.motions.length) {
        return;
    }

    this.motions.forEach(function (motion, index) {
        if (!motion.duration) {
            return;
        }

        var time = t - motion.startTime;

        if (time > motion.duration) {
            if (motion.loop) {
                time -= motion.duration;
                motion.startTime += motion.duration;
            } else {
                self.removeMotion(index);
                self.setParam(motion, 1);
                return motion.callback(time);
            }
        }

        // console.log('%s / %s (%s)', time, motion.duration, time / motion.duration);
        self.setParam(motion, time / motion.duration);
    });
};

InkaModel.prototype.setParam = function (motion, rate) {
    if (motion.fn) {
        return motion.fn.call(this, rate);
    }

    var parameter = this.scene.getFloatVector(motion.param),
        value = motion.from + (
            motion.to - motion.from
        ) * rate;

    // console.log('%s -> %s [%s]', motion.from, motion.to, value);

    if (!parameter) {
        console.error('%s is invalid parameter.', motion.param);
        return;
    }

    parameter[motion.paramIndex] = value + motion.offset;
};

InkaModel.prototype.removeMotion = function (index) {
    var motions = [];
    this.motions.forEach(function (motion, i) {
        if (i !== index) {
            motions.push(motion);
        }
    });
    this.motions = motions;
};

InkaModel.prototype.motion = function (opts) {
    var motion = {
        startTime: new Date().getTime(),
        param: opts.param || 'time',
        paramIndex: opts.paramIndex || 0,
        offset: opts.offset || 0,
        from: opts.from || 0,
        to: opts.to || (opts.duration / 1000) || 0,
        duration: opts.duration || 0,
        loop: opts.loop === undefined ? false : opts.loop,
        fn: opts.fn,
        callback: function () {}
    };

    this.motions.push(motion);

    this.parent.startTicker();

    var deffered = {
        done: function (fn) {
            motion.callback = fn;
            return deffered;
        }
    };
    return deffered;
};

InkaModel.prototype.keyframe = function (from, to, opts) {
    opts = opts || {};

    var speed = opts.speed || 1;

    // opts.offset = Math.min(from, to) / 1000;
    opts.duration = Math.abs(to - from) / speed;
    opts.from = from / 1000;
    opts.to = to / 1000;

    // console.log(opts);

    // overwrite current keyframe
    if (this.currentKeyframe >= 0) {
        // console.log('[overwrite keyframe!!]');
        this.removeMotion(this.currentKeyframe);
    } else {
        // console.log('[this is first keyframe?]');
        // console.log(this);
    }
    this.currentKeyframe = this.motions.length;

    return this.motion(opts);
};

InkaModel.prototype.clearMotion = function () {
    this.motions = [];
};
