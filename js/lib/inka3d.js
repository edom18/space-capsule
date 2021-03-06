var inka3d =
{
	trunc: function (a)
	{
		return a - a % 1;
	},
	
	// matrix multiply fr = fa * fb (column-major Float32Array(16))
	matrix4x4Mul: function (fa, fb, fr)
	{
		var a = fa[0];
		var b = fa[1];
		var c = fa[2];
		var d = fa[3];
		var e = fb[0];
		var f = fb[1];
		var g = fb[2];
		var h = fb[3];
		var i = fa[4];
		var j = fa[5];
		var k = fa[6];
		var l = fa[7];
		var m = fa[8];
		var n = fa[9];
		var o = fa[10];
		var p = fa[11];
		var q = fa[12];
		var r = fa[13];
		var s = fa[14];
		var t = fa[15];
		var u = fb[4];
		var v = fb[5];
		var w = fb[6];
		var x = fb[7];
		var y = fb[8];
		var z = fb[9];
		var A = fb[10];
		var B = fb[11];
		var C = fb[12];
		var D = fb[13];
		var E = fb[14];
		var F = fb[15];
		fr[0] = a * e + i * f + m * g + q * h;
		fr[1] = b * e + j * f + n * g + r * h;
		fr[2] = c * e + k * f + o * g + s * h;
		fr[3] = d * e + l * f + p * g + t * h;
		fr[4] = a * u + i * v + m * w + q * x;
		fr[5] = b * u + j * v + n * w + r * x;
		fr[6] = c * u + k * v + o * w + s * x;
		fr[7] = d * u + l * v + p * w + t * x;
		fr[8] = a * y + i * z + m * A + q * B;
		fr[9] = b * y + j * z + n * A + r * B;
		fr[10] = c * y + k * z + o * A + s * B;
		fr[11] = d * y + l * z + p * A + t * B;
		fr[12] = a * C + i * D + m * E + q * F;
		fr[13] = b * C + j * D + n * E + r * F;
		fr[14] = c * C + k * D + o * E + s * F;
		fr[15] = d * C + l * D + p * E + t * F;
	},
	
	// matrix invert fr = inv(fa) (column-major Float32Array(16))
	matrix4x4Inv: function (fa, fr)
	{
		var a = fa[4];
		var b = fa[5];
		var c = fa[6];
		var d = fa[7];
		var e = fa[8];
		var f = fa[9];
		var g = fa[10];
		var h = fa[11];
		var i = fa[12];
		var j = fa[13];
		var k = fa[14];
		var l = fa[15];
		var m = e * l - h * i;
		var n = f * l - h * j;
		var o = g * l - h * k;
		var p = e * k - g * i;
		var q = f * i - e * j;
		var r = g * j - f * k;
		var s = b * o - c * n - d * r;
		var t = c * m - d * p - a * o;
		var u = q * -d + a * n - b * m;
		var v = a * r + b * p + c * q;
		var w = fa[0];
		var x = fa[1];
		var y = fa[2];
		var z = fa[3];
		var A = i * z - l * w;
		var B = j * z - l * x;
		var C = k * z - l * y;
		var D = i * y - k * w;
		var E = j * w - i * x;
		var F = k * x - j * y;
		var G = w * d - z * a;
		var H = x * d - z * b;
		var I = y * d - z * c;
		var J = w * c - y * a;
		var K = x * a - w * b;
		var L = y * b - x * c;
		var M = a * h - d * e;
		var N = b * h - d * f;
		var O = c * h - d * g;
		var P = a * g - c * e;
		var Q = b * e - a * f;
		var R = c * f - b * g;
		var S = 1.0 / (w * s + x * t + y * u + z * v);
		fr[0] = S * s;
		fr[1] = S * -(f * C - g * B - h * F);
		fr[2] = S * (j * I - k * H - l * L);
		fr[3] = S * -(x * O - y * N - z * R);
		fr[4] = S * t;
		fr[5] = S * -(g * A - h * D - e * C);
		fr[6] = S * (k * G - l * J - i * I);
		fr[7] = S * -(y * M - z * P - w * O);
		fr[8] = S * u;
		fr[9] = S * -(E * -h + e * B - f * A);
		fr[10] = S * (K * -l + i * H - j * G);
		fr[11] = S * -(Q * -z + w * N - x * M);
		fr[12] = S * v;
		fr[13] = S * -(e * F + f * D + g * E);
		fr[14] = S * (i * L + j * J + k * K);
		fr[15] = S * -(w * R + x * P + y * Q);
	},

	// calculate projection matrix fr (Float32Array(16)) from camera parameters fp
	// fp[0]:
	//   perspective fit mode: 1.0: fill, 2.0: horizontal, 3.0: vertical, 4.0: overscan
	//   orthographic fit mode: -1.0: fill, -2.0: horizontal, -3.0: vertical, -4.0: overscan
	// fp[1]:
	//   perspective: focal length
	//   orthographic: orthographic width
	// fp[2], fp[3]: film size
	// fp[4], fp[5]: film offset
	// fp[6]: near clipping plane
	// fp[7]: far clipping plane
	// aspect: aspect ratio of viewport (width/height)
	matrix4x4Projection: function (fp, aspect, fr)
	{
		var a = fp[2];
		var b = fp[3];
		var c = fp[0];
		var d = c * c;
		var e;
		if (d < 2.0)
		{
			e = aspect * b > a;
		}
		else
		{
			var f;
			if (d < 5.0)
			{
				f = -1;
			}
			else
			{
				var g;
				if (d < 10.0)
				{
					g = 0;
				}
				else
				{
					g = aspect * b < a;
				}
				f = g;
			}
			e = f;
		}
		var h;
		var i;
		if (e != 0)
		{
			h = a;
			i = a / aspect;
		}
		else
		{
			h = b * aspect;
			i = b;
		}
		var j = fp[1] * 2.0;
		var k = fp[4] * 2.0 / h;
		var l = fp[5] * 2.0 / i;
		var m;
		var n;
		var o;
		var p;
		var q;
		var r;
		var s;
		var t;
		if (c < 0.0)
		{
			var u = fp[6];
			var v = fp[7];
			var w = 1.0 / (u - v);
			m = 0.0;
			n = 0.0;
			o = w * 2.0;
			p = 0.0;
			q = k;
			r = l;
			s = (v + u) * w;
			t = 1.0;
		}
		else
		{
			var x = fp[6];
			var y = fp[7];
			var z = 1.0 / (x - y);
			m = k;
			n = l;
			o = (y + x) * z;
			p = -1.0;
			q = 0.0;
			r = 0.0;
			s = y * 2.0 * x * z;
			t = 0.0;
		}
		fr[0] = j / h;
		fr[1] = 0.0;
		fr[2] = 0.0;
		fr[3] = 0.0;
		fr[4] = 0.0;
		fr[5] = j / i;
		fr[6] = 0.0;
		fr[7] = 0.0;
		fr[8] = m;
		fr[9] = n;
		fr[10] = o;
		fr[11] = p;
		fr[12] = q;
		fr[13] = r;
		fr[14] = s;
		fr[15] = t; 
	},
	
	// create a renderer with given number of pre-allocated render jobs (100 for small scenes, 10000 for large scenes)
	createRenderer: function(numRenderJobs)
	{
		// build render jobs
		var begin = {p: null, n: null, next: null, render: null, instance: null, frenderJob: new Float32Array(18)};
		var end = begin;
		var n = numRenderJobs + 1;
		while (n > 1)
		{
			var rj = {p: end, n: null, next: null, render: null, instance: null, frenderJob: new Float32Array(18)};
			end.n = rj;
			end = rj;
			--n;
		}
				
		// create renderer
		var renderer = {
			// render queues
			iBegin: begin, iEnd: end, iResetShader: function () {},
			begin: null, end: null, resetShader: null, alphaSort: null,
			
			// picking
			pickFBO: null, pickProjectionMatrix: new Float32Array(16),
			pickPixel: new Uint8Array(4), nextObjectId: 1,
		};
		
		// create an empty group of scenes. pass it to createScene to create an instance of a scene in the group
		renderer.createGroup = function ()
		{
			var group = {renderer: renderer, scenes: []};
			
			// update a group of scenes using given time and timeStep (both float)
			group.update = function (time, timeStep)
			{
				var scenes = group.scenes;
				var i;
				for (i = 0; i < scenes.length; ++i)
				{
					scenes[i].update(time, timeStep);
				}
			}
			
			// render a group of scenes using given view/projection matrix (both Float32Array[16]) and layer name.
			// default render state is assumed and left behind
			group.render = function (viewMatrix, projectionMatrix, layerName)
			{
				var rq = renderer;
				rq.begin = rq.iBegin;
				rq.end = rq.iEnd;
				rq.resetShader = rq.iResetShader;
				rq.alphaSort = null;
				
				var scenes = group.scenes;
				for (var i = 0; i < scenes.length; ++i)
				{
					scenes[i].render(viewMatrix, projectionMatrix, layerName, rq);
				}
				
				if (rq.alphaSort != null)
				{
					gl.depthMask(false);
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
					rq.resetShader = inka3d.renderSorted(rq.alphaSort, rq.resetShader);
					gl.blendFunc(gl.ONE, gl.ZERO);
					gl.disable(gl.BLEND);
					gl.depthMask(true);
				}
				
				rq.resetShader();
				
				gl.useProgram(null);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
				gl.disable(gl.CULL_FACE);
				gl.cullFace(gl.BACK);
			}
			
			// pick an object in given group at device coordinates x, y which range from -1 to 1. If an object was hit,
			// return its handle. Handles to objects can be obtained with getObjectHandle().
			// only works if a pick render layer is present
			group.pick = function (viewMatrix, projectionMatrix, x, y)
			{
				// save viewport
				var viewport = gl.getParameter(gl.VIEWPORT);
				
				// save clear color
				var clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
				
				// pick area
				var fp = projectionMatrix;
				var fr = renderer.pickProjectionMatrix;
				var a = x * -10000.0;
				var b = y * -10000.0;
				var c = fp[3];
				var d = fp[7];
				var e = fp[11];
				var f = fp[15];
				fr[0] = fp[0] * 10000.0 + a * c;
				fr[1] = fp[1] * 10000.0 + b * c;
				fr[2] = fp[2];
				fr[3] = c;
				fr[4] = fp[4] * 10000.0 + a * d;
				fr[5] = fp[5] * 10000.0 + b * d;
				fr[6] = fp[6];
				fr[7] = d;
				fr[8] = fp[8] * 10000.0 + a * e;
				fr[9] = fp[9] * 10000.0 + b * e;
				fr[10] = fp[10];
				fr[11] = e;
				fr[12] = fp[12] * 10000.0 + a * f;
				fr[13] = fp[13] * 10000.0 + b * f;
				fr[14] = fp[14];
				fr[15] = f; 

				// set fbo (1x1 render target)
				if (!renderer.pickFBO)
					if (!(renderer.pickFBO = inka3d.createFrameBuffer(1, 1)))
						alert("could not create frame buffer for picking");	
				gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.pickFBO);

				// render
				gl.viewport(0, 0, 1, 1);
				gl.clearColor(0, 0, 0, 1);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				group.render(viewMatrix, fr, "pick");

				// get pixel
				var pixel = renderer.pickPixel;
				gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

				// unset fbo
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
				
				// restore viewport
				gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
				
				// restore clear color
				gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
				
				return (pixel[0] >> 3) + (pixel[1] >> 2) * 32 + (pixel[2] >> 3) * 2048;
			}
			
			return group
		}
		
		return renderer;
	},

	// create frame buffer with color and depth render buffer
	createFrameBuffer: function(width, height)
	{
		var buffer0 = gl.createRenderbuffer();
		var buffer1 = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, buffer0);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGB565, width, height);
		gl.bindRenderbuffer(gl.RENDERBUFFER, buffer1);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);

		var fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, buffer0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buffer1);
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		// release render buffers, the frame buffer still holds a reference
		gl.deleteRenderbuffer(buffer0);
		gl.deleteRenderbuffer(buffer1);
		
		if (status == gl.FRAMEBUFFER_COMPLETE)
			return fbo;
			
		gl.deleteFramebuffer(fbo);
		return null;
	},
	
	// simplex noise
	noise: function(x, y, z)
	{
		var l = arguments.length;
		if (l == 1)
			return inka3d.noise2f(x, 0);
		if (l == 2)
			return inka3d.noise2f(x, y);
		if (l == 3)
			return inka3d.noise3f(x, y, z);		
	},
	
	// internal helper functions
	
	renderSorted: function(list, resetShader)
	{
		// list merge sort by Simon Tatham
		var insize = 1;
		while (true)
		{
			var p = list;
			list = null;
			var tail = null;
			var nmerges = 0;
			while (p != null)
			{
				nmerges++;
				var q = p;
				var psize = 0;
				var i;
				for (i = 0; i < insize; i++)
				{
					psize++;
					q = q.next;
					if (q == null)
						break;
				}
				var qsize = insize;
				var e;
				while (psize > 0 || (qsize > 0 && q != null))
				{
					if (psize == 0)
					{
						e = q; q = q.next; qsize--;
					}
					else if (qsize == 0 || q == null)
					{
						e = p; p = p.next; psize--;
					}
					else if (p.frenderJob[16] > q.frenderJob[16])
					{
						e = p; p = p.next; psize--;
					}
					else
					{
						e = q; q = q.next; qsize--;
					}
					if (tail != null)
						tail.next = e;
					else
						list = e;
					tail = e;
				}
				p = q;
			}
			tail.next = null;
			if (nmerges <= 1)
				break;
			insize *= 2;
		}
		while (list != null)
		{
			resetShader = list.render(list, resetShader);
			list = list.next;
		}
		return resetShader;
	},
	
	createVertexShader: function (code, name)
	{
		var shader = gl.createShader(gl.VERTEX_SHADER);	
		gl.shaderSource(shader, code);
		gl.compileShader(shader);
		return shader;		
	},
	
	createPixelShader: function (code, name)
	{
		var shader = gl.createShader(gl.FRAGMENT_SHADER);	
		gl.shaderSource(shader, code);
		gl.compileShader(shader);
		return shader;		
	},
	
	eStT: function (xValues, keys, numKeys, x)
	{
		var low = 0;
		var high = numKeys; 		
		var a = (low + high) >> 1;
		while (low < high - 1)
		{
			if (xValues[a] > x)
				high = a;
			else
				low = a;			
			a = (low + high) >> 1;
		}

		return keys[a];
	},
	
	eSpT: function (xValues, keys, numKeys, x)
	{
		var low = 0;
		var high = numKeys; 		
		var a = (low + high) >> 1;
		while (low < high - 1)
		{
			if (xValues[a] > x)
				high = a;
			else
				low = a;			
			a = (low + high) >> 1;
		}		

		var b = a * 3;
		var c = xValues[a];
		var d = (x - c) / (xValues[a + 1] - c);
		var e = d * d;
		var f = e * d;
		return (f * 2.0 + e * -3.0 + 1.0) * keys[b + 1] + (f + e * -2.0 + d) * keys[b + 2] + (f + e * -1.0) * keys[b + 3] + (f * -2.0 + e * 3.0) * keys[b + 4]; 	
	},
	
	eWSpT: function (xValues, keys, numKeys, x)
	{
		var low = 0;
		var high = numKeys; 		
		var a = (low + high) >> 1;
		while (low < high - 1)
		{
			if (xValues[a] > x)
				high = a;
			else
				low = a;			
			a = (low + high) >> 1;
		}

		var b = a * 5;
		var c = xValues[a];
		var d = keys[b + 4];
		var e = keys[b + 5];
		var f = xValues[a + 1];
		var g = x;
		var h = (g - c) / (f - c);
		var i = h * h;
		var j = c * 2.0 + d + e + f * -2.0;
		var k = c * -3.0 + d * -2.0 + e * -1.0 + f * 3.0;
		var l = h - (i * h * j + i * k + h * d + c - g) / (i * 3.0 * j + h * 2.0 * k + d);
		var m = l * l;
		var n = l - (m * l * j + m * k + l * d + c - g) / (m * 3.0 * j + l * 2.0 * k + d);
		var o = n * n;
		var p = n - (o * n * j + o * k + n * d + c - g) / (o * 3.0 * j + n * 2.0 * k + d);
		var q = p * p;
		var r = q * p;
		return (r * 2.0 + q * -3.0 + 1.0) * keys[b + 2] + (r + q * -2.0 + p) * keys[b + 3] + (r + q * -1.0) * keys[b + 6] + (r * -2.0 + q * 3.0) * keys[b + 7]; 		
	},

	sCRT: function (keys, x)
	{
		var a = x;
		var b = Math.floor(a);
		var c = a - b;
		var d = b;
		var e = c * c;
		var f = e * c;
		return (keys[d] * (e * 2.0 - f - c) + keys[d + 1] * (f * 3.0 - e * 5.0 + 2.0) + keys[d + 2] * (f * -3.0 + e * 4.0 + c) + keys[d + 3] * (f - e)) * 0.5;
	},
	
	perm: [
		151,160,137,91,90,15,
		131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
		190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
		88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
		77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
		102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
		135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
		5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
		223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
		129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
		251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
		49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
		138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
		
		151,160,137,91,90,15,
		131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
		190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
		88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
		77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
		102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
		135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
		5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
		223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
		129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
		251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
		49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
		138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
	],

	grad: [
		 1,  1,  0,  1,
		-1,  1,  0,  1,
		 1, -1,  0,  1,
		-1, -1,  0,  1,
		 1,  0,  1,  1,
		-1,  0,  1,  1,
		 1,  0, -1,  1,
		-1,  0, -1,  1,
		 0,  1,  1,  1,
		 0, -1,  1,  1,
		 0,  1, -1,  1,
		 0, -1, -1,  1,
		 1,  1,  0, -1,
		-1,  1,  0, -1,
		 1, -1,  0, -1,
		-1, -1,  0, -1,
		 1,  0,  1, -1,
		-1,  0,  1, -1,
		 1,  0, -1, -1,
		-1,  0, -1, -1,
		 0,  1,  1, -1,
		 0, -1,  1, -1,
		 0,  1, -1, -1,
		 0, -1, -1, -1,
		 1,  1,  1,  0,
		 1,  1, -1,  0,
		 1, -1,  1,  0,
		 1, -1, -1,  0,
		-1,  1,  1,  0,
		-1,  1, -1,  0,
		-1, -1,  1,  0,
		-1, -1, -1,  0
	],
	
	noise2f: function(x, y)
	{
		var perm = inka3d.perm;
		var grad = inka3d.grad;
		
		var a = x;
		var b = y;
		var c = (a + b) * 0.366;
		var d = Math.floor(a + c);
		var e = Math.floor(b + c);
		var f = (d + e) * 0.2113;
		var g = a - (d - f);
		var h = b - (e - f);
		var i;
		var j;
		if (g > h)
		{
			i = 1;
			j = 0;
		}
		else
		{
			i = 0;
			j = 1;
		}
		var k = g - i + 0.2113;
		var l = h - j + 0.2113;
		var m = g + -0.5774;
		var n = h + -0.5774;
		var o = d & 255;
		var p = e & 255;
		var q = perm[o + perm[p]] % 12 << 2;
		var r = perm[o + i + perm[p + j]] % 12 << 2;
		var s = perm[o + 1 + perm[p + 1]] % 12 << 2;
		var t = Math.max(0.5 - (g * g + h * h), 0.0);
		var u = Math.max(0.5 - (k * k + l * l), 0.0);
		var v = Math.max(0.5 - (m * m + n * n), 0.0);
		var w = t * t;
		var x = u * u;
		var y = v * v;
		return (w * w * (grad[q] * g + grad[q | 1] * h) + x * x * (grad[r] * k + grad[r | 1] * l) + y * y * (grad[s] * m + grad[s | 1] * n)) * 70.0;
	},
	
	noise3f: function(x, y, z)
	{
		var perm = inka3d.perm;
		var grad = inka3d.grad;

		var a = x;
		var b = y;
		var c = z;
		var d = (a + b + c) * 0.333333;
		var e = Math.floor(a + d);
		var f = Math.floor(b + d);
		var g = Math.floor(c + d);
		var h = (e + f + g) * 0.166666;
		var i = a - (e - h);
		var j = b - (f - h);
		var k = c - (g - h);
		var l;
		var m;
		var n;
		var o;
		var p;
		var q;
		if (i < j)
		{
			var r;
			var s;
			var t;
			var u;
			if (j < k)
			{
				r = 0;
				s = 1;
				t = 0;
				u = 1;
			}
			else
			{
				var v;
				var w;
				if (i < k)
				{
					v = 0;
					w = 1;
				}
				else
				{
					v = 1;
					w = 0;
				}
				r = 1;
				s = 0;
				t = v;
				u = w;
			}
			l = 0;
			m = r;
			n = s;
			o = t;
			p = 1;
			q = u;
		}
		else
		{
			var x;
			var y;
			var z;
			var A;
			if (j < k)
			{
				var B;
				var C;
				if (i < k)
				{
					B = 0;
					C = 1;
				}
				else
				{
					B = 1;
					C = 0;
				}
				x = B;
				y = C;
				z = 0;
				A = 1;
			}
			else
			{
				x = 1;
				y = 0;
				z = 1;
				A = 0;
			}
			l = x;
			m = 0;
			n = y;
			o = 1;
			p = z;
			q = A;
		}
		var D = i - l + 0.166666;
		var E = j - m + 0.166666;
		var F = k - n + 0.166666;
		var G = i - o + 0.333333;
		var H = j - p + 0.333333;
		var I = k - q + 0.333333;
		var J = i + -0.5;
		var K = j + -0.5;
		var L = k + -0.5;
		var M = e & 255;
		var N = f & 255;
		var O = g & 255;
		var P = perm[M + perm[N + perm[O]]] % 12 << 2;
		var Q = perm[M + l + perm[N + m + perm[O + n]]] % 12 << 2;
		var R = perm[M + o + perm[N + p + perm[O + q]]] % 12 << 2;
		var S = perm[M + 1 + perm[N + 1 + perm[O + 1]]] % 12 << 2;
		var T = Math.max(0.6 - (i * i + j * j + k * k), 0.0);
		var U = Math.max(0.6 - (D * D + E * E + F * F), 0.0);
		var V = Math.max(0.6 - (G * G + H * H + I * I), 0.0);
		var W = Math.max(0.6 - (J * J + K * K + L * L), 0.0);
		var X = T * T;
		var Y = U * U;
		var Z = V * V;
		var ab = W * W;
		return (X * X * (grad[P] * i + grad[P | 1] * j + grad[P | 2] * k) + Y * Y * (grad[Q] * D + grad[Q | 1] * E + grad[Q | 2] * F) + Z * Z * (grad[R] * G + grad[R | 1] * H + grad[R | 2] * I) + ab * ab * (grad[S] * J + grad[S | 1] * K + grad[S | 2] * L)) * 32.0;
	},
	
	getIntVector: function (name, length, infos, istate)
	{
		var info = infos[name];
		if (!info)
			return null;
		if (info.t != 0)
			return null;
		if (length > info.e - info.b)
			return null;
		return istate.subarray(info.b, info.e);
	},
	getIntArray: function (name, infos, istate)
	{
		var info = infos[name];
		if (!info)
			return null;
		if (info.t != 0)
			return null;
		return istate.subarray(info.b, info.e);
	},
	getFloatVector: function (name, length, infos, fstate)
	{
		var info = infos[name];
		if (!info)
			return null;
		if (info.t != 1)
			return null;
		if (length > info.e - info.b)
			return null;
		return fstate.subarray(info.b, info.e);
	},
	getFloatArray: function (name, infos, fstate)
	{
		var info = infos[name];
		if (!info)
			return null;
		if (info.t != 1)
			return null;
		return fstate.subarray(info.b, info.e);
	},
	getTexture: function (name, index, infos, ostate)
	{
		var info = infos[name];
		if (!info)
			return null;
		if (info.t != 2)
			return null;
		var i = index || 0;
		if (i < 0 || i >= info.l)
			return null;
		return ostate[info.b + i];
	},
	setTexture: function (name, texture, index, infos, ostate)
	{
		var info = infos[name];
		if (!info)
			return;
		if (info.t != 2)
			return;
		var i = index || 0;
		if (i < 0 || i >= info.l)
			return;
		ostate[info.b + i] = texture;
	},
	getObjectId: function (name, infos, ids, renderer)
	{
		var index = infos[name];
		if (typeof index === "undefined")
			return -1;
		if (ids[index] == 0)
		{
			ids[index] = renderer.nextObjectId++;
		}
		return ids[index];
	}
};
var digi = inka3d;
