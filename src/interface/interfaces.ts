export interface ImgurOptions {
    clientid: string;
    callback?: (data: any) => void;
    onLoading?: () => void;
    onSuccess?: (data: any) => void;
    onSuccessAll?: (data: any) => void;
    onError?: (error: any) => void;
}
