class Imgur {
    static version = '1.1.0';
    clientid;
    endpoint;
    dropzone;
    info;
    onLoading;
    onSuccess;
    onSuccessAll;
    onError;
    constructor(options) {
        if (!options || !options.clientid) {
            throw 'Provide a valid Client Id here: https://api.imgur.com/';
        }
        this.clientid = options.clientid;
        this.endpoint = 'https://api.imgur.com/3/image';
        this.dropzone = document.querySelectorAll('.dropzone');
        this.info = document.querySelectorAll('.info');
        this.onLoading = options.onLoading || (() => {
            document.body.classList.add('loading');
        });
        this.onSuccess = options.onSuccess || ((data) => {
            document.body.classList.remove('loading');
        });
        this.onSuccessAll = options.onSuccessAll || ((data) => {
            document.body.classList.remove('loading');
        });
        this.onError = options.onError || ((errorMsg) => {
            document.body.classList.remove('loading');
            console.error('Invalid archive', errorMsg);
        });
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
    matchFiles(file, zone, fileCount) {
        if (file.type.match(/image/) && file.type !== 'image/svg+xml') {
            this.onLoading();
            const fd = new FormData();
            fd.append('image', file);
            this.post(this.endpoint, fd).then(data => {
                if (fileCount[0] + 1 === fileCount[1]) {
                    this.onSuccessAll(data);
                }
                this.onSuccess(data);
            }).catch(error => {
                this.onError(error);
                throw new Error(error);
            });
        }
        else {
            this.onError(new Error('Invalid archive'));
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
            // Reset input
            e.target.value = '';
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
