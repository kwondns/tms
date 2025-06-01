export type UploadSuccessType = { success: true; originalName: string; size: number; filePath: string };
export type UploadFailedType = { success: false; originalName: string; error: any };

export type UploadResultType = (UploadSuccessType | UploadFailedType)[];
