/* Imgur Upload Script */
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Imgur = factory();
    }
}(this, function() {
    'use strict';
    let Imgur = function(options) {
        if (!this || !(this instanceof Imgur)) {
            return new Imgur(options);
        }

        if (!options) {
            options = {};
        }

        if (!options.clientid) {
            throw 'Provide a valid Client Id here: https://api.imgur.com/';
        }

        this.clientid = options.clientid;
        this.endpoint = 'https://api.imgur.com/3/image';
        this.callback = options.callback;
        this.dropzone = document.querySelectorAll('.dropzone');
        this.info = document.querySelectorAll('.info');

        this.run();
    };

    Imgur.prototype = {
        createEls: function(name, props, text) {
            let el = document.createElement(name);
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    el[prop] = props[prop];
                }
            }
            if (text) {
                el.appendChild(document.createTextNode(text));
            }
            return el;
        },
        insertAfter: function(referenceNode, newNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        },
        post: async function(path, data) {
            const response = await fetch(path, {
                method: 'POST',
                headers: {
                    'Authorization': 'Client-ID ' + this.clientid
                },
                body: data
            });
        
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP error, status = ${response.status}`);
            }
        },
        createDragZone: function() {
            let p1 = this.createEls('p', {}, 'Drop Image File Here');
            let p2 = this.createEls('p', {}, 'Or click here to select image');
            let input = this.createEls('input', {type: 'file', multiple: 'multiple', className: 'input', accept: 'image/*'});

            Array.from(this.info).forEach(zone => {
                zone.appendChild(p1);
                zone.appendChild(p2);
            });

            Array.from(this.dropzone).forEach(zone => {
                zone.appendChild(input);
                this.status(zone);
                this.upload(zone);
            });
        },
        loading: function() {
            let div = this.createEls('div', {className: 'loading-modal'});
            let table = this.createEls('table', {className: 'loading-table'});
            let img = this.createEls('img', {className: 'loading-image', src: './css/loading-spin.svg'});

            div.appendChild(table);
            table.appendChild(img);
            document.body.appendChild(div);
        },
        status: function(el) {
            let div = this.createEls('div', {className: 'status'});
            this.insertAfter(el, div);
        },
        matchFiles: function(file, zone, fileCount) {
            let status = zone.nextSibling;

            if (file.type.match(/image/) && file.type !== 'image/svg+xml') {
                document.body.classList.add('loading');
                status.classList.remove('bg-success', 'bg-danger');
                status.innerHTML = '';

                let fd = new FormData();
                fd.append('image', file);

                this.post(this.endpoint, fd).then(data => {
                    if (fileCount[0]+1 == fileCount[1]) {
                        document.body.classList.remove('loading');
                    }
                    if (typeof this.callback === 'function') this.callback.call(this, data);
                }).catch(error => {
                    status.classList.remove('bg-success');
                    status.classList.add('bg-danger');
                    status.innerHTML = 'Invalid archive';
                    throw new Error(error);
                });
            } else {
                status.classList.remove('bg-success');
                status.classList.add('bg-danger');
                status.innerHTML = 'Invalid archive';
            }
        },
        upload: function(zone) {
            let addOrRemClass = (event, e, classListMethod) => {
                if (e.target && e.target.nodeName === 'INPUT' && e.target.type === 'file') {
                    if (event === 'dragleave' || event === 'drop') {
                        e.target.parentNode.classList[classListMethod]('dropzone-dragging');
                    }
                }
            };

            zone.addEventListener('change', e => {
                if (e.target && e.target.nodeName === 'INPUT' && e.target.type === 'file') {
                    let target = e.target.files;

                    for (let i = 0; i < target.length; i++) {
                        this.matchFiles(target[i], zone, [i, target.length]);
                    }
                }
            });

            ['dragenter', 'dragleave', 'dragover', 'drop'].forEach(event => {
                zone.addEventListener(event, e => addOrRemClass(event, e, 'add'), false);
                zone.addEventListener(event, e => addOrRemClass(event, e, 'remove'), false);
            });
        },
        run: function() {
            let loadingModal = document.querySelector('.loading-modal');

            if (!loadingModal) {
                this.loading();
            }
            this.createDragZone();
        }
    };

    return Imgur;
}));
