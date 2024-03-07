interface ImgurOptions {
    clientid: string;
    callback?: (data: any) => void;
    onLoading?: () => void;
    onSuccess?: (data: any) => void;
    onSuccessAll?: (data: any) => void;
    onError?: (error: any) => void;
}

declare class Imgur {
    static readonly version = "__version__";
    clientid: string;
    endpoint: string;
    dropzone: NodeListOf<Element>;
    info: NodeListOf<Element>;
    onLoading: () => void;
    onSuccess: (data: any) => void;
    onSuccessAll: (data: any) => void;
    onError: (errorMsg: any) => void;
    constructor(options: ImgurOptions);
    private createEls;
    private post;
    private createDragZone;
    private loading;
    private matchFiles;
    private upload;
    private run;
}

export { type ImgurOptions, Imgur as default };
