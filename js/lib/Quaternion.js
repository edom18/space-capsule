(function (win, doc, exports) {

    'use strict';

    var sin = Math.sin,
        cos = Math.cos;

    /**
     * Make rotation quaternion
     * @param {number} t.
     * @param {Vector3} v.
     */
    function Quaternion(t, v) {
        this.set(t, v);
    }

    Quaternion.prototype = {
        constructor: Quaternion,
        set: function (t, v) {
            this.t = t;
            this.v = v;
        },

        multiply: function (A) {
            return Quaternion.multiply(this, A);
        }
    };

    /**
     * Multiply quaternions.
     *
     * @example
     *      Quaternionの掛け算の公式は以下。
     *      ・は内積、×は外積、U, Vはともにベクトル。
     *      ;の左が実部、右が虚部。基本的に実部は`0`で計算。
     *      A = (a; U) 
     *      B = (b; V) 
     *      AB = (ab - U・V; aV + bU + U×V)
     */
    Quaternion.multiply = function (A, B) {

        var Av, Bv,
            d1, d2, d3, d4, t,
            x, y, z;

        Av = A.v;
        Bv = B.v;

        // 実部の計算
        d1 =  A.t * B.t;
        d2 = -Av.x * Bv.x;
        d3 = -Av.y * Bv.y;
        d4 = -Av.z * Bv.z;
        t = parseFloat((d1 + d2 + d3 + d4).toFixed(5));

        // 虚部xの計算
        d1 = (A.t * Bv.x) + (B.t * Av.x);   //aV + bU
        d2 = (Av.y * Bv.z) - (Av.z * Bv.y); //U x V
        x = parseFloat((d1 + d2).toFixed(5));

        // 虚部yの計算
        d1 = (A.t * Bv.y) + (B.t * Av.y);   //aV + bU
        d2 = (Av.z * Bv.x) - (Av.x * Bv.z); //U x V
        y = parseFloat((d1 + d2).toFixed(5));

        // 虚部zの計算
        d1 = (A.t * Bv.z) + (B.t * Av.z);   //aV + bU
        d2 = (Av.x * Bv.y) - (Av.y * Bv.x); //U x V
        z = parseFloat((d1 + d2).toFixed(5));

        return new Quaternion(t, new Vector3(x, y, z));
    };

    /**
     * Make a quaternion.
     * @param {number} radian
     * @param {Vector3} vector
     * @return {Quaternion}
     */
    function makeRotatialQuaternion(radian, vector) {

        var ret = new Quaternion(),
            ccc = 0,
            sss = 0,
            axis = new Vector3(vector.toArray()),
            norm = vector.norm();

        if (norm <= 0.0) {
            return ret;
        }

        axis.normalize();

        ccc = cos(0.5 * radian);
        sss = sin(0.5 * radian);

        t = ccc;
        axis.multiplyScalar(sss);

        ret.set(t, axis);

        return ret;
    }

    /*!--------------------------------------------------
      EXPORTS
    ----------------------------------------------------- */
    exports.Quaternion = Quaternion;
    exports.makeRotatialQuaternion = makeRotatialQuaternion;

}(window, document, window));
