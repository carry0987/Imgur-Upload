class Imgur {
    clientid;
    endpoint;
    callback;
    dropzone;
    info;
    constructor(options) {
        if (!options || !options.clientid) {
            throw 'Provide a valid Client Id here: https://api.imgur.com/';
        }
        this.clientid = options.clientid;
        this.endpoint = 'https://api.imgur.com/3/image';
        this.callback = options.callback;
        this.dropzone = document.querySelectorAll('.dropzone');
        this.info = document.querySelectorAll('.info');
        this.run();
    }
    createEls(name, props, text) {
        const el = document.createElement(name);
        for (const prop in props) {
            if (props.hasOwnProperty(prop)) {
                el[prop] = props[prop];
            }
        }
        if (text) {
            el.appendChild(document.createTextNode(text));
        }
        return el;
    }
    insertAfter(referenceNode, newNode) {
        referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
    }
    async post(path, data) {
        const response = await fetch(path, {
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID ' + this.clientid
            },
            body: data
        });
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error(`HTTP error, status = ${response.status}`);
        }
    }
    createDragZone() {
        const p1 = this.createEls('p', {}, 'Drop or Paste Image File Here');
        const p2 = this.createEls('p', {}, 'Or click here to select image');
        const input = this.createEls('input', { type: 'file', multiple: 'multiple', className: 'input', accept: 'image/*' });
        Array.from(this.info).forEach(zone => {
            zone.appendChild(p1);
            zone.appendChild(p2);
        });
        Array.from(this.dropzone).forEach(zone => {
            zone.appendChild(input);
            this.status(zone);
            this.upload(zone);
        });
        window.addEventListener('paste', (e) => {
            const zone = this.dropzone[0];
            const items = (e.clipboardData || e.originalEvent?.clipboardData).items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file' && item.type.startsWith('image')) {
                    const blob = item.getAsFile();
                    this.matchFiles(blob, zone, [i, items.length]);
                }
            }
        });
    }
    loading() {
        const div = this.createEls('div', { className: 'loading-modal' });
        const table = this.createEls('table', { className: 'loading-table' });
        const img = this.createEls('img', { className: 'loading-image', src: './css/loading-spin.svg' });
        div.appendChild(table);
        table.appendChild(img);
        document.body.appendChild(div);
    }
    status(el) {
        const div = this.createEls('div', { className: 'status' });
        this.insertAfter(el, div);
    }
    matchFiles(file, zone, fileCount) {
        const status = zone.nextSibling;
        if (file.type.match(/image/) && file.type !== 'image/svg+xml') {
            document.body.classList.add('loading');
            status.classList.remove('bg-success', 'bg-danger');
            status.innerHTML = '';
            const fd = new FormData();
            fd.append('image', file);
            this.post(this.endpoint, fd).then(data => {
                if (fileCount[0] + 1 === fileCount[1]) {
                    document.body.classList.remove('loading');
                }
                if (typeof this.callback === 'function')
                    this.callback.call(this, data);
            }).catch(error => {
                status.classList.remove('bg-success');
                status.classList.add('bg-danger');
                status.innerHTML = 'Invalid archive';
                throw new Error(error);
            });
        }
        else {
            status.classList.remove('bg-success');
            status.classList.add('bg-danger');
            status.innerHTML = 'Invalid archive';
        }
    }
    upload(zone) {
        const addOrRemClass = (event, e, classListMethod) => {
            if (e.target && e.target.nodeName === 'INPUT' && e.target.type === 'file') {
                if (event === 'dragleave' || event === 'drop') {
                    const parentElement = e.target.parentElement;
                    if (parentElement) {
                        parentElement.classList[classListMethod]('dropzone-dragging');
                    }
                }
            }
        };
        zone.addEventListener('change', e => {
            if (e.target && e.target.nodeName === 'INPUT' && e.target.type === 'file') {
                const target = e.target.files;
                for (let i = 0; i < target.length; i++) {
                    this.matchFiles(target[i], zone, [i, target.length]);
                }
            }
        });
        ['dragenter', 'dragleave', 'dragover', 'drop'].forEach(event => {
            zone.addEventListener(event, e => addOrRemClass(event, e, 'add'), false);
            zone.addEventListener(event, e => addOrRemClass(event, e, 'remove'), false);
        });
    }
    run() {
        const loadingModal = document.querySelector('.loading-modal');
        if (!loadingModal) {
            this.loading();
        }
        this.createDragZone();
    }
}

export { Imgur as default };
