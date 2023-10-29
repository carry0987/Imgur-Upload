interface ImgurOptions {
    clientid: string;
    callback?: (data: any) => void;
}
declare class Imgur {
    clientid: string;
    endpoint: string;
    callback?: (data: any) => void;
    dropzone: NodeListOf<Element>;
    info: NodeListOf<Element>;
    constructor(options: ImgurOptions);
    private createEls;
    private insertAfter;
    private post;
    private createDragZone;
    private loading;
    private status;
    private matchFiles;
    private upload;
    run(): void;
}

export { Imgur as default };
