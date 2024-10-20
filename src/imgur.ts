/* Imgur Upload Script */
import { ImgurOptions } from '@/interface/interfaces';

class Imgur {
    static readonly version = '__version__';

    clientid: string;
    endpoint: string;
    dropzone: NodeListOf<Element>;
    info: NodeListOf<Element>;

    onLoading: () => void;
    onSuccess: (data: any) => void;
    onSuccessAll: (data: any) => void;
    onError: (errorMsg: any) => void;

    constructor(options: ImgurOptions) {
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

        this.onSuccess = options.onSuccess || ((data: any) => {
            document.body.classList.remove('loading');
        });

        this.onSuccessAll = options.onSuccessAll || ((data: any) => {
            document.body.classList.remove('loading');
        });

        this.onError = options.onError || ((errorMsg: any) => {
            document.body.classList.remove('loading');
            console.error('Invalid archive', errorMsg);
        });

        this.run();
    }

    private createEls(name: string, props: Record<string, any>, text?: string): HTMLElement {
        const el = document.createElement(name);
        for (const prop in props) {
            if (props.hasOwnProperty(prop)) {
                (el as any)[prop] = props[prop];
            }
        }
        if (text) {
            el.appendChild(document.createTextNode(text));
        }
        return el;
    }

    private async post(path: string, data: FormData): Promise<any> {
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
    }

    private createDragZone(): void {
        const p1 = this.createEls('p', {}, 'Drop or Paste Image File Here');
        const p2 = this.createEls('p', {}, 'Or click here to select image');
        const input = this.createEls('input', {type: 'file', multiple: 'multiple', className: 'input', accept: 'image/*'});

        Array.from(this.info).forEach(zone => {
            zone.appendChild(p1);
            zone.appendChild(p2);
        });

        Array.from(this.dropzone).forEach(zone => {
            zone.appendChild(input);
            this.upload(zone);
        });

        window.addEventListener('paste', (e: ClipboardEvent) => {
            const zone = this.dropzone[0];
            const items = (e.clipboardData || (e as any).originalEvent?.clipboardData).items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file' && item.type.startsWith('image')) {
                    const blob = item.getAsFile();
                    this.matchFiles(blob, zone, [i, items.length]);
                }
            }
        });
    }

    private loading(): void {
        const div = this.createEls('div', {className: 'loading-modal'});
        const table = this.createEls('table', {className: 'loading-table'});
        const img = this.createEls('img', {className: 'loading-image', src: './css/loading-spin.svg'});

        div.appendChild(table);
        table.appendChild(img);
        document.body.appendChild(div);
    }

    private matchFiles(file: Blob, zone: Element, fileCount: [number, number]) {
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
        } else {
            this.onError(new Error('Invalid archive'));
        }
    }

    private upload(zone: Element) {
        const addOrRemClass = (event: string, e: Event, classListMethod: 'add' | 'remove') => {
            if (e.target && (e.target as HTMLElement).nodeName === 'INPUT' && (e.target as HTMLInputElement).type === 'file') {
                if (event === 'dragleave' || event === 'drop') {
                    const parentElement = (e.target as HTMLElement).parentElement;
                    if (parentElement) {
                        parentElement.classList[classListMethod]('dropzone-dragging');
                    }
                }
            }
        };

        zone.addEventListener('change', e => {
            if (e.target && (e.target as HTMLElement).nodeName === 'INPUT' && (e.target as HTMLInputElement).type === 'file') {
                const target = (e.target as HTMLInputElement).files!;
                for (let i = 0; i < target.length; i++) {
                    this.matchFiles(target[i], zone, [i, target.length]);
                }
            }
            // Reset input
            (e.target as HTMLInputElement).value = '';
        });

        ['dragenter', 'dragleave', 'dragover', 'drop'].forEach(event => {
            zone.addEventListener(event, e => addOrRemClass(event, e, 'add'), false);
            zone.addEventListener(event, e => addOrRemClass(event, e, 'remove'), false);
        });
    }

    private run(): void {
        const loadingModal = document.querySelector('.loading-modal');
        if (!loadingModal) {
            this.loading();
        }
        this.createDragZone();
    }
}

export { Imgur as default };
export * from './interface/interfaces';
