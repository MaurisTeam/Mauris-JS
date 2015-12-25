angular.module('Mauris', [])

.factory('imageUploader', [
	'$q',
	function ($q){

		var service = {};

		var dataURItoBlob = function(dataURI) {
            var byteString = atob(dataURI.split(',')[1]),
                mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0],
                ab = new ArrayBuffer(byteString.length),
                ia = new Uint8Array(ab),
                blob;

            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            blob = new Blob([ab], {type: 'image/jpeg'});
            return blob;
        };

        service.getImageClass = function (){
        	return {
        		constructor: function (data, name, key){
        			this.data = data;
        			this.name = name;
        			this.key = key;
                    return this;
        		}
        	};
        };

        service.convertImgToBase64URL = function (url){
            var q = $q.defer(),
                img = new Image();

            img.crossOrigin = 'Anonymous';
            img.onload = function(){
                var canvas = document.createElement('CANVAS'),
                    ctx = canvas.getContext('2d'),
                    dataURL;

                canvas.height = this.height;
                canvas.width = this.width;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL('image/jpeg');
                canvas = null;
                q.resolve(dataURL);
            };
            img.src = url;

            return q.promise;
        };

		service.upload = function (params, url, images){
			var q = $q.defer(),
				formData = new FormData(),
                request = new XMLHttpRequest(),
                blob;

            if (params) {
                for (var key in params) {
                    formData.append(key, params[key]);
                }
            }

            if (images.length) {
            	for (var i = 0; i < images.length; i++) {
            		blob = dataURItoBlob(images[i].data);
            		formData.append(images[i].key, blob, images[i].name);
            	}
            }

            request.onreadystatechange = function(){
                if (request.readyState == 4) {
                    try {
                        var resp = JSON.parse(request.response);
                        q.resolve(resp);
                    } catch (error){
                        var resp = {
                            status: 'error',
                            data: 'Unknown error occurred: [' + request.responseText + ']'
                        };
                        q.reject(error);
                    }
               }
            };

            request.open('POST', url);
            request.send(formData);

            return q.promise;
		};

		return service;
}]);