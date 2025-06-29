export const customResponseMessage = async (fnSignature: string, fnName: string, customMsg: string, toRemoteLog?: boolean) => {
    const msg = `${fnSignature} | ${fnName} | ${customMsg}`;
    if (toRemoteLog) { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.log(msg);
    }
    return msg;
}
export const catchedErrorMessage = async (fnSignature: string, fnName: string, error: Error, toRemoteLog?: boolean) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    if (toRemoteLog) { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.error(errorMsg);
    }
    return errorMsg;
}
export const missingParamErrorMessage = async (fnSignature: string, fnName: string, missingParamMsg: string, toRemoteLog?: boolean) => {
    const errorMsg = `${fnSignature} | ${fnName} | ${missingParamMsg}`;
    if (toRemoteLog) { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.error(errorMsg);
    }
    return errorMsg;
}
export const notOkErrorMessage = async (fnSignature: string, fnName: string, response: Response, toRemoteLog?: boolean) => {
    const errorMsg = `${fnSignature} | ${fnName} | not ok response: ${response.status} - ${response.statusText} `;
    if (toRemoteLog) { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.error(errorMsg);
    }
    return errorMsg;
}
